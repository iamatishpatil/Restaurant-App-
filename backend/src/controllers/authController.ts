import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const signup = async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        password: hashedPassword,
        role: 'CUSTOMER'
      }
    });

    // Dummy OTP Verification Success
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const userId = (req as any).user.id;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error });
  }
};
export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch failed', error });
  }
};
