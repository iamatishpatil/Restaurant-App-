import { Request, Response } from "express";
import { prisma } from "../index";
import { socketService } from "../services/socketService";
import { sendNotification } from "../services/notificationService";

export const createReservation = async (req: any, res: Response) => {
  try {
    const { date, time, partySize, specialRequest } = req.body;
    const userId = req.user.id;
    
    // Check for deposit requirement in settings
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    const depositAmount = Number(settings?.reservationDeposit || 0);

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        date: new Date(date),
        time,
        partySize,
        specialRequest,
        depositAmount,
        status: depositAmount > 0 ? "AWAITING_PAYMENT" : "PENDING"
      },
      include: { user: true }
    });

    // Notify admins via Socket
    socketService.notifyNewReservation(reservation);

    // Also send a push to admins (could be multiple, for now just log it or send to a specific admin)
    // For now, only notify the customer that their request is pending
    await sendNotification(userId, "Reservation Received", "Your table reservation has been received and is pending confirmation.");

    res.status(201).json(reservation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyReservations = async (req: any, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user.id },
      include: { table: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { user: true, table: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { createNotification } from "./notificationController";

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, tableId, rejectionReason } = req.body;
    
    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { table: true }
    });
    if (!existing) return res.status(404).json({ message: "Reservation not found" });

    // Validate table existence if tableId is provided
    if (tableId) {
      const table = await prisma.table.findUnique({ where: { id: tableId } });
      if (!table) return res.status(404).json({ message: "Table not found" });
    }

    const data: any = { status };
    if (tableId) data.tableId = tableId;
    if (rejectionReason) data.rejectionReason = rejectionReason;

    const reservation = await prisma.reservation.update({
      where: { id },
      data,
      include: { user: true, table: true }
    });

    // Notify user
    let title = "";
    let message = "";
    if (status === 'CONFIRMED') {
        title = "Reservation Confirmed!";
        message = `Your table for ${reservation.partySize} guests on ${reservation.date.toLocaleDateString()} has been confirmed. See you at ${reservation.time}!`;
    } else if (status === 'CANCELLED') {
        title = "Reservation Cancelled";
        message = `Sorry, your reservation for ${reservation.date.toLocaleDateString()} was cancelled. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
    }

    if (title) {
        await sendNotification(reservation.userId, title, message);
    }

    // Notify real-time (optional, can add a general reservation update event if needed)
    if (this && (this as any).io) {
       // Optional socket emit
    }
    
    res.json(reservation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const payReservation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { 
        status: "PENDING", 
        depositPaid: true,
        paymentId: `PAY_RES_${Date.now()}`
      }
    });

    // Notify user of payment success
    await sendNotification(
      reservation.userId, 
      "Deposit Received", 
      "We've received your deposit. Your reservation is now pending restaurant confirmation."
    );

    res.json(reservation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
