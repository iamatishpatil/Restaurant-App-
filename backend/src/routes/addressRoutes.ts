import express from 'express';
import { getAddresses, createAddress, deleteAddress } from '../controllers/addressController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Protect all address routes
router.use(authenticate);

router.get('/', getAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

export default router;
