import { Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import { sendNotification } from "../services/notificationService";
import { socketService } from "../services/socketService";
import { printerService } from "../services/printerService";

const orderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
    notes: z.string().nullable().optional()
  })),
  totalPrice: z.number(),
  deliveryType: z.enum(["DELIVERY", "PICKUP", "DINE_IN"]),
  tableId: z.string().nullable().optional(),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["UPI", "CARD", "COD"]).default("UPI"),
});

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, totalPrice, deliveryType, addressId, tableId } = orderSchema.parse(req.body);
    let { paymentMethod } = req.body;
    
    // For DINE_IN, always default to COD (Pay at Restaurant) for post-paid flow
    if (deliveryType === 'DINE_IN') {
      paymentMethod = 'COD';
    }
    
    const userId = req.user.id;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal: totalPrice,
          taxAmount: 0,
          grandTotal: totalPrice,
          deliveryType,
          tableId: (deliveryType === "DINE_IN" ? tableId : null) || null,
          addressId: deliveryType === "DELIVERY" ? addressId : null,
          status: "NEW_ORDER",
          orderItems: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes,
            })),
          },
        }
      });

      // 2. Create Payment linked to Order
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod as string,
          status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
          amount: totalPrice,
          transactionId: paymentMethod === "COD" ? null : `TXN_${Date.now()}`,
        }
      });

      // 3. Return full order payload
      const fullOrder = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: { 
          orderItems: { include: { menuItem: true } }, 
          payments: true,
          user: true,
          table: true 
        },
      });
      return fullOrder;
    });

    // Notify real-time subscribers
    socketService.notifyNewOrder(order);

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        orderItems: { include: { menuItem: true } }, 
        user: true,
        address: true 
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, cancelReason } = req.body;
    const userRole = (req as any).user?.role;

    // RBAC: Enforce valid status transitions by role
    if (userRole === "CHEF" && !["PREPARING", "READY", "CANCELLED"].includes(status)) {
      return res.status(403).json({ message: "Chefs can only update status to PREPARING, READY, or CANCELLED" });
    }
    if (userRole === "WAITER" && !["SERVED", "COMPLETED"].includes(status)) {
      return res.status(403).json({ message: "Waiters can only update status to SERVED or COMPLETED" });
    }
    
    // Logic: If status is COMPLETED, also ensure payment status is UPDATED if it's COD
    const orderData: any = { status };
    if (cancelReason) {
      orderData.cancelReason = cancelReason;
    }
    
    if (status === "COMPLETED") {
       // Auto-update linked payment to COMPLETED
       await prisma.order.findUnique({
         where: { id },
         include: { payments: true }
       }).then(async (o) => {
         const pendingPayment = o?.payments?.[0];
         if (pendingPayment?.id) {
           await prisma.payment.update({
             where: { id: pendingPayment.id },
             data: { status: 'COMPLETED' }
           });
         }
       });

       // Auto-deduct inventory (BOM tracker)
       const orderToDeduct = await prisma.order.findUnique({
         where: { id },
         include: { orderItems: { include: { menuItem: { include: { recipeIngredients: true } } } } }
       });
       
       if (orderToDeduct) {
         for (const item of orderToDeduct.orderItems) {
           const quantityOrdered = item.quantity;
           for (const recipeRef of item.menuItem.recipeIngredients) {
              const deductionAmount = recipeRef.quantity * quantityOrdered;
              await prisma.inventory.update({
                where: { id: recipeRef.inventoryId },
                data: { quantity: { decrement: deductionAmount } }
              });
           }
         }
       }
    }

    const order = await prisma.order.update({
      where: { id },
      data: orderData,
      include: { 
        user: true,
        orderItems: { include: { menuItem: true } },
        table: true
      },
    });

    // Notify real-time subscribers (KDS, Admin, Customer)
    socketService.notifyStatusUpdate(id, status);

    // Auto-print KOT when order is accepted
    if (status === "ACCEPTED") {
      printerService.autoPrintKDS(id);
    }

    // Specialized notification for waiters if food is ready
    if (status === "READY") {
      socketService.notifyReadyForPickup(order);
    }

    if (order.userId) {
      const msg = status === "CANCELLED" 
        ? `Your order was cancelled. Reason: ${cancelReason || 'Out of stock'}`
        : `Your order is now ${status}`;
      await sendNotification(order.userId, "Order Update", msg);
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const generateBill = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await printerService.autoPrintBill(id);
    res.json({ message: "Bill sent to printer" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: true, 
        address: true,
        payments: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
