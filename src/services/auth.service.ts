import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signAdminToken } from "../utils/jwt";

const prisma = new PrismaClient();
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes

export class AuthService {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw { status: 401, message: "Invalid credentials" };
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw {
        status: 423,
        message: "Account temporarily locked. Try again later.",
      };
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

      throw { status: 401, message: "Invalid credentials" };
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // FIXED: Added admin.role as the second argument
    const token = signAdminToken(admin.id, admin.role);
    return { token };
  }

  async changePassword(adminId: string, oldPass: string, newPass: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw { status: 404, message: "Admin not found" };
    }

    const isMatch = await bcrypt.compare(oldPass, admin.passwordHash);
    if (!isMatch) {
      throw { status: 400, message: "Current password incorrect" };
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