import { Request, Response } from "express";
import { prisma } from "../index";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { items: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const items = await prisma.menuItem.findMany({
      where: categoryId ? { categoryId: String(categoryId) } : {},
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id: id as string },
      include: { category: true },
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, categoryId, isVeg, image } = req.body;
    const item = await prisma.menuItem.create({
      data: { name, description, price, categoryId, isVeg, image },
    });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, isVeg, image, isAvailable } = req.body;
    const item = await prisma.menuItem.update({
      where: { id: id as string },
      data: { name, description, price, categoryId, isVeg, image, isAvailable },
    });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id: id as string } });
    res.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
