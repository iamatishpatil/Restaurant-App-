import { Request, Response } from "express";
import { prisma } from "../index";

export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createNotification = async (userId: string, title: string, message: string, type: string) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};
