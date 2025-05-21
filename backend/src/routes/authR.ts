import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, requestPasswordReset, resetPassword, verifyEmail, verifyResetLink, logout } from '../controllers/authController';
import { validateUser, isAuthenticated, isAdmin } from '../middleware/authM';

const router = express.Router();

// Rate limiting middleware
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many registration attempts from this IP, please try again after 15 minutes'
});

// Apply rate limiting and user validation to the register route
router.post('/register', registerLimiter, validateUser, register);

// Update the verify-email route to accept a token
router.get('/verify-email', verifyEmail);

// Add the login route
router.post('/login', login);

// Add the request password reset route
router.post('/request-password-reset', requestPasswordReset);

// Add the reset password route
router.post('/reset-password', resetPassword);

// Add link verification route
router.get('/verify-reset-link', verifyResetLink);

// Add the logout route
router.post('/logout', isAuthenticated, logout);

//example routes

// // Example of a protected route that requires authentication
// router.get('/profile', isAuthenticated, (req, res) => {
//   res.json({ user: req.user });
// });

// // Example of an admin-only route
// router.get('/panel', isAuthenticated, isAdmin, (req, res) => {
//   res.json({ message: 'Welcome to the admin dashboard' });
// });

export default router;