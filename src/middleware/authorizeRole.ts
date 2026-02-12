import { Request, Response, NextFunction } from 'express';
import { AdminRole } from '@prisma/client';

export const authorizeRole = (roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // adminAuth must run before this to populate req.admin
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(admin.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Requires one of these roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};