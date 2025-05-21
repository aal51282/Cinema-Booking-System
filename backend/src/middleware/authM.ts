import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, AccountStatus } from '../models/user';

// Extend the Request type to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, isAdmin, accountStatus } = req.body;
  const currentUser = req.user as User | undefined;

  // Basic validations for all users
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Admin-only validations
  if (currentUser && currentUser.isAdmin) {
    if (isAdmin !== undefined && typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'isAdmin must be a boolean' });
    }

    if (accountStatus && !Object.values(AccountStatus).includes(accountStatus)) {
      return res.status(400).json({ message: 'Invalid account status' });
    }
  } else {
    // Non-admin users cannot set these fields
    if (isAdmin !== undefined) {
      return res.status(403).json({ message: 'You do not have permission to set admin status' });
    }

    if (accountStatus !== undefined) {
      return res.status(403).json({ message: 'You do not have permission to set account status' });
    }
  }

  // Optional field validations
  if (firstName && typeof firstName !== 'string') {
    return res.status(400).json({ message: 'First name must be a string' });
  }

  if (lastName && typeof lastName !== 'string') {
    return res.status(400).json({ message: 'Last name must be a string' });
  }

  next();
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.'})
};
