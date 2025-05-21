import { Router } from 'express';
import { createPromotion, getPromotions, removePromotion } from '../controllers/promotionController';
import { isAdmin, isAuthenticated, isSubscribed } from '../middleware/promotionM';

const router = Router();

// Admin only routes
router.post('/', isAdmin, createPromotion);
router.delete('/:id', isAdmin, removePromotion);

// Authenticated and subscribed users can view promotions
router.get('/', isAuthenticated, getPromotions);

export default router;
