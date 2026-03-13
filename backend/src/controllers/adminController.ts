import { Request, Response } from 'express';
import { prisma } from '../index';
import { OrderStatus } from '@prisma/client';

// MenuCategory CRUD
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    let { restaurantId, ...data } = req.body;
    if (!restaurantId) {
      const rest = await prisma.restaurant.findFirst();
      restaurantId = rest?.id;
    }
    if (!restaurantId) {
      return res.status(400).json({ message: "No restaurant found. Create a restaurant first." });
    }
    const category = await prisma.menuCategory.create({ 
      data: { ...data, restaurantId } 
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.menuCategory.update({
      where: { id: id as string },
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
    const count = await prisma.menuItem.count({ where: { categoryId: id as string } });
    if (count > 0) {
      return res.status(400).json({ message: "Cannot delete category with active menu items" });
    }
    await prisma.menuCategory.delete({ where: { id: id as string } });
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Coupon CRUD
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { code: 'asc' }
    });
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
      where: { id: id as string },
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
    await prisma.coupon.delete({ where: { id: id as string } });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Banner CRUD
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { title: 'asc' }
    });
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
      where: { id: id as string },
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
    await prisma.banner.delete({ where: { id: id as string } });
    res.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany();
    const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    const menuItems = await prisma.menuItem.findMany({
      include: { reviews: true }
    });

    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalPrice), 0);
    // Active orders are anything not COMPLETED or CANCELLED
    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
    const newCustomers = users.length;
    const orderGrowth = 12.5; 

    const itemSales = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topSelling = itemSales.map((sale) => {
      const item = menuItems.find(i => i.id === sale.menuItemId);
      return {
        name: item?.name || 'Unknown',
        sales: sale._sum.quantity || 0,
        image: item?.image
      };
    });

    const bottomSales = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'asc' } },
      take: 5
    });

    const lowSelling = bottomSales.map((sale) => {
      const item = menuItems.find(i => i.id === sale.menuItemId);
      return {
        name: item?.name || 'Unknown',
        sales: sale._sum.quantity || 0,
        image: item?.image
      };
    });

    // Top Rated Items calculated from Reviews
    const topRated = menuItems
      .map(item => {
        const avgRating = item.reviews.length > 0 
          ? item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length 
          : 0;
        return {
          name: item.name,
          rating: avgRating,
          image: item.image
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

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
      chartData: last7Days.map(({name, revenue, orders}) => ({name, revenue, orders})),
      topSelling,
      lowSelling,
      topRated
    });
  } catch (error) {
    console.error(error);
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

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'NEW_ORDER' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(pendingOrders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Printer Management ---
export const getPrinters = async (req: Request, res: Response) => {
  try {
    const printers = await prisma.printer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(printers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrinter = async (req: Request, res: Response) => {
  try {
    const { name, type, connection, usage, restaurantId } = req.body;
    let targetRestaurantId = restaurantId;
    if (!targetRestaurantId) {
      const rest = await prisma.restaurant.findFirst();
      targetRestaurantId = rest?.id;
    }

    if (!targetRestaurantId) {
      return res.status(400).json({ message: "No restaurant found. Create a restaurant first." });
    }

    const printer = await prisma.printer.create({
      data: {
        name,
        type,
        connection,
        usage,
        restaurantId: targetRestaurantId
      }
    });
    res.status(201).json(printer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePrinter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.printer.delete({
      where: { id: id as string }
    });
    res.json({ message: "Printer deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
