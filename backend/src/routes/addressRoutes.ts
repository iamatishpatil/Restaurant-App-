import express from 'express';
import { getAddresses, createAddress, deleteAddress } from '../controllers/addressController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validation';
import { addressSchema } from '../validations/addressValidation';

const router = express.Router();

// Protect all address routes
router.use(authenticate);

router.get('/', getAddresses);
router.post('/', validate(addressSchema), createAddress);
router.delete('/:id', deleteAddress);

export default router;
