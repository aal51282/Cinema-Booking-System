import express from 'express';
import { calculateCart, applyPromoCode } from '../controllers/cartController';

const router = express.Router();

router.post('/calculate', calculateCart);
router.post('/apply-promotion', applyPromoCode);

export default router; 