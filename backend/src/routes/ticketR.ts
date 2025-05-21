import express from 'express';
import { getTicketTypes, updateTicketPrice } from '../controllers/ticketController';
import { isAuthenticated, isAdmin } from '../middleware/authM';

const router = express.Router();

router.get('/', getTicketTypes);
router.put('/:ticketId/price', isAuthenticated, isAdmin, updateTicketPrice);//only admin can update ticket price

export default router; 