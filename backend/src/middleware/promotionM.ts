import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../controllers/userController';

interface AuthRequest extends Request {
    user?: any;
}

// Middleware to check if user is authenticated
export const isAuthenticated = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const user = getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check if user is admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // First check if user is authenticated
        await isAuthenticated(req, res, () => {
            if (!req.user?.isAdmin) {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

// Middleware to check if user is subscribed to promotions
export const isSubscribed = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // First check if user is authenticated
        await isAuthenticated(req, res, () => {
            if (!req.user?.isPromoted) {
                return res.status(403).json({ message: 'User not subscribed to promotions' });
            }
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
