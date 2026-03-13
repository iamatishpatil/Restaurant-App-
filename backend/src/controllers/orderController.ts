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
    price: z.number()
  })),
  totalPrice: z.number(),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["UPI", "CARD", "COD"]).default("UPI"),
});

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, totalPrice, deliveryType, addressId, paymentMethod } = orderSchema.parse(req.body);
    const userId = req.user.id;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record first
      const payment = await tx.payment.create({
        data: {
          method: paymentMethod as string,
          status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
          amount: totalPrice,
          transactionId: paymentMethod === "COD" ? null : `TXN_${Date.now()}`,
        }
      });

      // 2. Create Order linked to Payment
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          deliveryType,
          addressId: deliveryType === "DELIVERY" ? addressId : null,
          status: "NEW_ORDER",
          paymentId: payment.id,
          orderItems: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { 
          orderItems: { include: { menuItem: true } }, 
          payment: true,
          user: true,
          table: true 
        },
      });
      return newOrder;
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
    const { status } = req.body;
    
    // Logic: If status is COMPLETED, also ensure payment status is UPDATED if it's COD
    const orderData: any = { status };
    if (status === "COMPLETED") {
       // Auto-update linked payment to COMPLETED
       await prisma.order.findUnique({
         where: { id },
         include: { payment: true }
       }).then(async (o) => {
         if (o?.paymentId) {
           await prisma.payment.update({
             where: { id: o.paymentId },
             data: { status: 'COMPLETED' }
           });
         }
       });
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
      await sendNotification(order.userId, "Order Update", `Your order is now ${status}`);
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
        payment: true,
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
