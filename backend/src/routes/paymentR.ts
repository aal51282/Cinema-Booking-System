import express from 'express';
import { addPayment, getUserPaymentMethods, deletePayment, updatePayment } from '../controllers/paymentController';
import { isAuthenticated } from '../middleware/authM';

const router = express.Router();

router.post('/:userId', isAuthenticated, addPayment);
router.get('/:userId', isAuthenticated, getUserPaymentMethods);
router.delete('/:userId/:paymentId', isAuthenticated, deletePayment);
router.put('/:userId/:paymentId', isAuthenticated, updatePayment);

export default router;