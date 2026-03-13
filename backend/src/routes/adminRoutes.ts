import express from 'express';
import { 
  getCategories, createCategory, updateCategory, deleteCategory,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getBanners, createBanner, updateBanner, deleteBanner,
  getAnalytics, getSettings, updateSettings, getNotifications,
  getPrinters, createPrinter, deletePrinter
} from '../controllers/adminController';
import { getStaff, createStaff, updateStaff, deleteStaff, getInventory, updateInventory, createInventory, deleteInventory, getUsers } from '../controllers/adminManagementController';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemChef } from '../controllers/menuController';
import { getReviews, deleteReview } from '../controllers/reviewController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteCategory);

// Menu Items (Admin Namespace)
router.get('/menu', authenticate, authorize('ADMIN', 'MANAGER', 'CHEF'), getMenuItems);
router.post('/menu', authenticate, authorize('ADMIN', 'MANAGER'), createMenuItem);
router.put('/menu/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateMenuItem);
router.patch('/menu/:id/status', authenticate, authorize('CHEF'), updateMenuItemChef);
router.delete('/menu/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteMenuItem);

router.get('/coupons', getCoupons);
router.post('/coupons', authenticate, authorize('ADMIN', 'MANAGER'), createCoupon);
router.put('/coupons/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCoupon);
router.delete('/coupons/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteCoupon);

router.get('/banners', getBanners);
router.post('/banners', authenticate, authorize('ADMIN', 'MANAGER'), createBanner);
router.put('/banners/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateBanner);
router.delete('/banners/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteBanner);

router.get('/analytics', authenticate, authorize('ADMIN', 'MANAGER'), getAnalytics);

router.get('/notifications', authenticate, authorize('ADMIN', 'MANAGER'), getNotifications);

router.get('/settings', authenticate, authorize('ADMIN', 'MANAGER'), getSettings);
router.put('/settings', authenticate, authorize('ADMIN', 'MANAGER'), updateSettings);

// Staff
router.get('/staff', authenticate, authorize('ADMIN', 'MANAGER'), getStaff);
router.post('/staff', authenticate, authorize('ADMIN', 'MANAGER'), createStaff);
router.put('/staff/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateStaff);
router.delete('/staff/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteStaff);

// Inventory
router.get('/inventory', authenticate, authorize('ADMIN', 'MANAGER', 'CHEF'), getInventory);
router.post('/inventory', authenticate, authorize('ADMIN', 'MANAGER', 'CHEF'), createInventory);
router.put('/inventory/:id', authenticate, authorize('ADMIN', 'MANAGER', 'CHEF'), updateInventory);
router.delete('/inventory/:id', authenticate, authorize('ADMIN', 'MANAGER', 'CHEF'), deleteInventory);

// Users
router.get('/users', authenticate, authorize('ADMIN', 'MANAGER'), getUsers);

// Reviews
router.get('/reviews', authenticate, authorize('ADMIN', 'MANAGER'), getReviews);
router.delete('/reviews/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteReview);

// Printers
router.get('/printers', authenticate, authorize('ADMIN', 'MANAGER'), getPrinters);
router.post('/printers', authenticate, authorize('ADMIN', 'MANAGER'), createPrinter);
router.delete('/printers/:id', authenticate, authorize('ADMIN', 'MANAGER'), deletePrinter);

export default router;
