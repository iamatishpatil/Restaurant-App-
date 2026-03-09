import { Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import { sendNotification } from "../services/notificationService";

const orderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })),
  totalPrice: z.number(),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]),
  addressId: z.string().optional(),
});

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, totalPrice, deliveryType, addressId } = orderSchema.parse(req.body);
    const userId = req.user.id;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          totalItems: items.length,
          deliveryType,
          addressId: deliveryType === "DELIVERY" ? addressId : null,
          status: "PENDING",
          orderItems: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { orderItems: true },
      });
      return newOrder;
    });

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
    const { id } = req.params;
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
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    if (order.userId) {
      await sendNotification(order.userId, "Order Update", `Your order is now ${status}`);
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, orderItems: true, address: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
