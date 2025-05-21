import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//user related
import { addUser, getUserByEmail, updateUser, updatePassword, getUserById } from '../controllers/userController';
import { User, AccountStatus } from '../models/user';

//email related
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { hashPassword } from '../utils/passwordUtil';

//payment related
import { validatePaymentCard } from '../utils/paymentUtil';
import { Payment } from '../models/payment';
import { addPaymentMethods } from '../services/paymentService';



export const register = async (req: Request, res: Response) => {
  try {
    console.log(req.body)

    const { email, password, firstName, lastName, payments, promotionsEnabled, billingAddress } = req.body;

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Validate and process payment cards
    let validatedPayments: Payment[] = [];
    if (payments && Array.isArray(payments)) {
      validatedPayments = payments
        .slice(0, 3) // Limit to 3 payment methods
        .filter(payment => validatePaymentCard(payment))
        .map(payment => ({
          ...payment,
          userId: 0 // This will be updated after user creation
        }));
        
    }

    // Create new user object (but don't save to database yet)
    const newUser: User = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isAdmin: false,
      accountStatus: AccountStatus.Active,
      isPromoted: promotionsEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payments: validatedPayments,
      billingAddress: JSON.stringify(billingAddress)
    };

    // Generate a JWT token for email verification
    const token = jwt.sign(
      newUser,
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await sendVerificationEmail(newUser, token);
      res.status(200).json({ message: 'Verification email sent. Please check your email to complete registration.' });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration process' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/verification?status=no_token`);
  }

  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as User;

    // Check if user already exists (in case they clicked the link more than once)
    const existingUser = getUserByEmail(decoded.email);
    
    if (existingUser) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification?status=already_verified`);
    }

    // Add user to database
    const userId = addUser(decoded);

    // Add payment methods if any
    if (decoded.payments && decoded.payments.length > 0) {
      const updatedPayments = decoded.payments.map(payment => ({
        ...payment,
        userId: userId
      }));
      await addPaymentMethods(updatedPayments);
    }

    // Redirect to frontend with success status
    res.redirect(`${process.env.FRONTEND_URL}/verification?status=success`);
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.redirect(`${process.env.FRONTEND_URL}/verification?status=token_expired`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.redirect(`${process.env.FRONTEND_URL}/verification?status=invalid_token`);
    // } else if (error instanceof Error) {
      // res.redirect(`${process.env.FRONTEND_URL}/verification?status=database_error&message=${encodeURIComponent(error.message)}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/verification?status=unknown_error`);
    }
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a JWT token with 10 minutes expiration
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '10m' }
    );

    // Send password reset email with the reset link
    await sendPasswordResetEmail(user, token);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// This function is used to reset the password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, email: string };
    
    const user = getUserByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await updateUser({
      userId: user.userId,
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    });

    // Send success response
    //note: we can show a popup window on frontend to inform the status of the password reset
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      // This will catch both expiration and invalid token errors
      res.status(400).json({ message: 'Invalid or expired reset token' });
    } else {
      res.status(500).json({ message: 'An error occurred while resetting the password' });
    }
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, user } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    if (!getUserById(user.userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await updatePassword(user.userId!, hashedNewPassword);

    res.status(200).json({ message: 'Password changed successfully', redirectUrl: '/login' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'An error occurred while changing the password' });
  }
};


const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// In-memory store for login attempts
const loginAttempts: { [key: string]: { count: number, lastAttempt: number } } = {};

export const login = async (req: Request, res: Response) => {
  console.log(`Login request received with body: ${JSON.stringify(req.body, null, 2)}`);
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is active
    if (user.accountStatus !== AccountStatus.Active) {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    // Check login attempts
    const now = Date.now();
    if (loginAttempts[email] && now - loginAttempts[email].lastAttempt < LOGIN_ATTEMPT_EXPIRY) {
      if (loginAttempts[email].count >= MAX_LOGIN_ATTEMPTS) {
        return res.status(403).json({ success: false, message: 'Too many failed login attempts. Please try again later.' });
      }
    } else {
      // Reset attempts if expired
      loginAttempts[email] = { count: 0, lastAttempt: now };
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      loginAttempts[email].count += 1;
      loginAttempts[email].lastAttempt = now;
      
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    delete loginAttempts[email];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET as string,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    console.log(`User: ${JSON.stringify(user)}`)

    // Determine redirect URL based on user role
    const redirectUrl = user.isAdmin ? '/panel' : '/'; // "/panel" url is for admin, "/" url is main page

    res.json({ 
      success: true, 
      token,
      redirectUrl,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
};

// This function is used to verify the reset link and make sure it's not expired, it shows a page with message if the link is valid or not
export const verifyResetLink = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Reset link is required' });
  }

  try {
    // Verify the JWT token
    jwt.verify(token as string, process.env.JWT_SECRET as string);
    
    // If verification is successful, send a success response
    res.status(200).json({ message: 'Reset link is valid' });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(400).json({ message: 'Reset link has expired' });
    } else {
      res.status(400).json({ message: 'Invalid reset link' });
    }
  }
};

export const logout = (req: Request, res: Response) => {
  // Since JWT is stateless, we can't invalidate the token on the server side.
  res.status(200).json({ 
    message: 'Logout successful',
    redirectUrl: '/login' // or any other page
  });
};
