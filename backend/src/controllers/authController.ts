import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;
  
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] }
  });

  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 400);
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

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ 
    user, 
    token 
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;
  
  let user: any = await prisma.user.findFirst({
    where: email ? { email } : { phone }
  });

  if (!user && email) {
    user = await prisma.staff.findFirst({
      where: { email }
    });
  }

  if (!user) {
    throw new AppError('No user found with those credentials', 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    user, 
    token 
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const userId = (req as any).user.id;
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, phone }
  });
  
  res.json(user);
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  let user: any = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    user = await prisma.staff.findUnique({
      where: { id: userId }
    });
  }
  
  if (!user) {
    throw new AppError('Profile not found', 404);
  }
  
  res.json(user);
});

export const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  
  // Clean phone number (remove all non-numeric characters)
  const cleanPhone = phone.replace(/\D/g, '');
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
  
  res.json({ 
    status: 'success',
    message: 'OTP sent successfully', 
    otp: code // Remove 'otp' in production
  });
});

export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanCode = code.toString().trim();
  
  let otp;
  // BYPASS FOR TESTING: Always allow 9999
  if (cleanCode === '9999') {
     otp = { phone: cleanPhone, code: '9999', expiresAt: new Date(Date.now() + 1000 * 60) };
  } else {
     otp = await prisma.oTP.findFirst({
       where: { phone: cleanPhone, code: cleanCode }
     });
  }

  if (!otp) {
    throw new AppError('Invalid OTP. Please check the code and try again.', 400);
  }

  if (otp.expiresAt < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
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

  // Delete used OTP if it came from DB
  if ((otp as any).id) {
    await prisma.oTP.delete({ where: { id: (otp as any).id } });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    user, 
    token 
  });
});
