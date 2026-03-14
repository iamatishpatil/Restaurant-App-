import { Request, Response } from 'express';
import { prisma } from '../index';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.query;
    const reviews = await prisma.review.findMany({
      where: menuItemId ? { menuItemId: String(menuItemId) } : {},
      include: { 
        user: { select: { name: true } },
        menuItem: { select: { name: true } }
      }
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const review = await prisma.review.create({
      data: { ...req.body, userId }
    });
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id: id as string } });
    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
