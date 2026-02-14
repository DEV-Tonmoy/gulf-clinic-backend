import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from Cookie or Authorization Header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // 2. Verify the token
    const decoded = verifyToken(token);
    
    // 3. Match the Role
    if (!decoded) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    const role = (decoded as any).role?.toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    // 4. Attach decoded admin to the request object
    (req as any).admin = decoded; 
    next();
};

export const requireAdmin = adminAuth;