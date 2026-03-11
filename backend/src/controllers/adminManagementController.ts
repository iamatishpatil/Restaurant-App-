import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.create({
      data: { name, email, password: hashedPassword, role }
    });
    res.status(201).json(staff);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, ...data } = req.body;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const staff = await prisma.staff.update({
      where: { id: id as string },
      data
    });
    res.json(staff);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.staff.delete({ where: { id: id as string } });
    res.json({ message: "Staff deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { itemName: 'asc' }
    });
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await prisma.inventory.update({
      where: { id: id as string },
      data: { quantity }
    });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createInventory = async (req: Request, res: Response) => {
  try {
    const { itemName, quantity, unit } = req.body;
    const item = await prisma.inventory.create({
      data: { itemName, quantity, unit }
    });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({ where: { id: id as string } });
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
