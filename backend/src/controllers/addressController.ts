import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAddresses = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const addresses = await prisma.address.findMany({ where: { userId } });
  res.json(addresses);
};

export const createAddress = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const address = await prisma.address.create({
    data: { ...req.body, userId }
  });
  res.status(201).json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.address.delete({ where: { id } });
  res.json({ message: 'Address deleted' });
};
