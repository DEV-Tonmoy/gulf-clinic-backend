import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, Admin } from "@prisma/client";

const prisma = new PrismaClient();

// This "extends" the Express Request type so req.admin is recognized
declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

interface JwtPayload {
  adminId: string;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const secret = process.env.JWT_SECRET || "fallback_secret_change_me";
    
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid admin session" });
    }

    // ✅ This will no longer be red because of the "declare global" above
    req.admin = admin;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
}