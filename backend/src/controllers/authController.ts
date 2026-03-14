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
    let user: any = await prisma.user.findFirst({
      where: email ? { email } : { phone }
    });

    if (!user && email) {
      user = await prisma.staff.findFirst({
        where: { email }
      });
    }

    if (!user) return res.status(404).json({ message: 'User or Staff not found' });

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
    let user: any = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      user = await prisma.staff.findUnique({
        where: { id: userId }
      });
    }
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch failed', error });
  }
};
export const sendOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    // Clean phone number (remove spaces, dashes etc)
    const cleanPhone = phone.replace(/\s+/g, '');
    
    // For testing, use static OTP 9999
    const code = "9999";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete existing OTPs for this phone
    await prisma.oTP.deleteMany({ where: { phone: cleanPhone } });

    await prisma.oTP.create({
      data: { phone: cleanPhone, code, expiresAt }
    });

    // In a real app, send via SMS gateway. For now, return in response for testing.
    console.log(`OTP for ${cleanPhone}: ${code}`);
    res.json({ message: 'OTP sent successfully', otp: code }); // Remove 'otp' in production
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  try {
    const cleanPhone = phone.replace(/\s+/g, '');
    const otp = await prisma.oTP.findFirst({
      where: { phone: cleanPhone, code }
    });

    if (!otp || otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP valid, find or create user
    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: `User ${cleanPhone.slice(-4)}`,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Dummy password
          role: 'CUSTOMER'
        }
      });
    }

    // Delete used OTP
    await prisma.oTP.delete({ where: { id: otp.id } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};
