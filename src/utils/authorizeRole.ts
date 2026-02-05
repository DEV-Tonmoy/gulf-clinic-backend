import { Request, Response, NextFunction } from "express";
import { AdminRole } from "@prisma/client";

export function authorizeRoles(allowedRoles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
