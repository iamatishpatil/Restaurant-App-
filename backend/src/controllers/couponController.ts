import { Request, Response } from 'express';
import { prisma } from '../index';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    const now = new Date();
    if (coupon.expiryDate < now) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (subtotal !== undefined && subtotal < Number(coupon.minOrderAmount)) {
      return res.status(400).json({ 
        message: `Min order amount for this coupon is ₹${coupon.minOrderAmount}` 
      });
    }

    res.json({
      message: 'Coupon validated successfully',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
