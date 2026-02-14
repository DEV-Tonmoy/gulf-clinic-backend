import { PrismaClient, Admin } from "@prisma/client";
import bcrypt from "bcrypt";
import { signAdminToken } from "../utils/jwt";

const prisma = new PrismaClient();
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes

export class AuthService {
  async login(email: string, password: string) {
    const admin: Admin | null = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      const error: any = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const error: any = new Error("Account temporarily locked. Try again later.");
      error.status = 423;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      const failedAttempts = admin.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME_MS);
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      const error: any = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = signAdminToken(admin.id, admin.role);
    return { token };
  }

  async changePassword(adminId: string, oldPass: string, newPass: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      const error: any = new Error("Admin not found");
      error.status = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(oldPass, admin.passwordHash);
    if (!isMatch) {
      const error: any = new Error("Current password incorrect");
      error.status = 400;
      throw error;
    }

    const newHash = await bcrypt.hash(newPass, 12);

    return await prisma.admin.update({
      where: { id: adminId },
      data: { 
        passwordHash: newHash,
        failedLoginAttempts: 0,
        lockedUntil: null 
      },
    });
  }
}

export const authService = new AuthService();