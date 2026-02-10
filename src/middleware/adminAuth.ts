import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from Cookie or Authorization Header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // 2. Verify the token
    const decoded = verifyToken(token);
    
    // 3. Match the Role (Checking for uppercase 'ADMIN' to match Prisma)
    if (!decoded || (decoded as any).role.toUpperCase() !== 'ADMIN' && (decoded as any).role.toUpperCase() !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // 4. FIX: Save to req.admin so your routes don't crash
    (req as any).admin = decoded; 
    next();
};

// Export as requireAdmin to match your route imports
export const requireAdmin = adminAuth;