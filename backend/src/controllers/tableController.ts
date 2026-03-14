import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export const createTable = async (req: Request, res: Response) => {
  const { tableNumber, capacity } = req.body;

  try {
    // Generate QR code data (e.g., a URL to the customer app with table/restaurant IDs)
    const qrData = JSON.stringify({
      tableNumber,
      action: 'ORDER'
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const table = await prisma.table.create({
      data: {
        tableNumber,
        capacity,
        qrCode: qrCodeUrl,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' }
    });
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTableStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const table = await prisma.table.update({
      where: { id: id as string },
      data: { status }
    });
    res.json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.table.delete({ where: { id: id as string } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTableBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: {
        tableId: id as string,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        payments: {
          some: { status: 'PENDING' }
        }
      },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        payments: true
      }
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No active unpaid orders for this table' });
    }

    // Aggregate all items from all orders
    const allItems: any[] = [];
    let grandTotal = 0;

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        allItems.push({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
          notes: item.notes
        });
        grandTotal += Number(item.price) * item.quantity;
      });
    });

    res.json({
      tableId: id,
      orders: orders.map(o => o.id),
      items: allItems,
      totalAmount: grandTotal
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
