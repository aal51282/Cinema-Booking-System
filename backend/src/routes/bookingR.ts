import express from 'express';
import { createBooking, getUserBookings } from '../controllers/bookingController';
import { isAuthenticated } from '../middleware/authM'; // Assuming you have authentication middleware

const router = express.Router();

// Route to handle creating a new booking
router.post('/', createBooking);

// Route to get bookings for a user
router.get('/:userId', getUserBookings);

export default router;