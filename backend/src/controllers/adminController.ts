import { Request, Response } from 'express';
import { prisma } from '../index';

// Category CRUD
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({
      where: { id },
      data: req.body
    });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if category has items
    const count = await prisma.menuItem.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({ message: "Cannot delete category with active menu items" });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Coupon CRUD
export const getCoupons = async (req: Request, res: Response) => {
  try {
    // Admin should see all coupons, active or not
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await prisma.coupon.create({ 
      data: { 
        ...req.body, 
        discount: Number(req.body.discount),
        expiryDate: new Date(req.body.expiryDate) 
      } 
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expiryDate, discount, ...data } = req.body;
    const updateData: any = { ...data };
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (discount !== undefined) updateData.discount = Number(discount);
    
    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Banner CRUD
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany();
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.update({
      where: { id },
      data: req.body
    });
    res.json(banner);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany();
    const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });

    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalPrice), 0);
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
    const newCustomers = users.length;
    const orderGrowth = 12.5; 

    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        dateStr: d.toDateString(),
        revenue: 0, 
        orders: 0 
      };
    });

    orders.forEach(order => {
      const orderDateStr = new Date(order.createdAt).toDateString();
      const dayData = last7Days.find(d => d.dateStr === orderDateStr);
      if (dayData) {
        dayData.revenue += Number(order.totalPrice);
        dayData.orders += 1;
      }
    });

    res.json({
      totalRevenue,
      activeOrders,
      newCustomers,
      orderGrowth,
      chartData: last7Days.map(({name, revenue, orders}) => ({name, revenue, orders}))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// Settings CRUD
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 'global' } });
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: req.body,
      create: { ...req.body, id: 'global' }
    });
    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
