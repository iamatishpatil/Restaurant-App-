import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAddresses = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const addresses = await prisma.address.findMany({ where: { userId } });
  res.json(addresses);
};

export const createAddress = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { type } = req.body;

  // Prevent redundant 'Current Location' entries by updating the existing one
  if (type === 'Current Location') {
    const existing = await prisma.address.findFirst({
      where: { userId, type: 'Current Location' }
    });

    if (existing) {
      const updated = await prisma.address.update({
        where: { id: existing.id },
        data: { ...req.body, userId }
      });
      return res.status(200).json(updated);
    }
  }

  const address = await prisma.address.create({
    data: { ...req.body, userId }
  });
  res.status(201).json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.address.delete({ where: { id } });
  res.json({ message: 'Address deleted' });
};
