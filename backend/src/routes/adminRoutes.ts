import express from 'express';
import { 
  getCategories, createCategory, updateCategory, deleteCategory,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getBanners, createBanner, updateBanner, deleteBanner,
  getAnalytics, getSettings, updateSettings, getNotifications
} from '../controllers/adminController';
import { getStaff, createStaff, updateStaff, deleteStaff, getInventory, updateInventory, createInventory, deleteInventory, getUsers } from '../controllers/adminManagementController';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import { getReviews, deleteReview } from '../controllers/reviewController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteCategory);

// Menu Items (Admin Namespace)
router.get('/menu', authenticate, authorize('ADMIN', 'MANAGER'), getMenuItems);
router.post('/menu', authenticate, authorize('ADMIN', 'MANAGER'), createMenuItem);
router.put('/menu/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateMenuItem);
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
router.get('/inventory', authenticate, authorize('ADMIN', 'MANAGER'), getInventory);
router.post('/inventory', authenticate, authorize('ADMIN', 'MANAGER'), createInventory);
router.put('/inventory/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateInventory);
router.delete('/inventory/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteInventory);

// Users
router.get('/users', authenticate, authorize('ADMIN', 'MANAGER'), getUsers);

// Reviews
router.get('/reviews', authenticate, authorize('ADMIN', 'MANAGER'), getReviews);
router.delete('/reviews/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteReview);

export default router;
