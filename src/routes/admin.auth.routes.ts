import { Router } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { signAdminToken } from "../utils/jwt";
import { adminLoginRateLimit } from "../middleware/adminRateLimit";

const router = Router();
const prisma = new PrismaClient();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes

router.post(
  "/login",
  adminLoginRateLimit,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password required" });
      }

      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check lock
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        return res.status(423).json({
          message: "Account temporarily locked. Try again later.",
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      // ❌ Wrong password
      if (!passwordMatch) {
        const failedAttempts = admin.failedLoginAttempts + 1;

        const updateData: any = {
          failedLoginAttempts: failedAttempts,
        };

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          updateData.lockedUntil = new Date(
            Date.now() + LOCK_TIME_MS
          );
        }

        await prisma.admin.update({
          where: { id: admin.id },
          data: updateData,
        });

        return res.status(401).json({ message: "Invalid credentials" });
      }

      // ✅ Successful login → reset counters
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      const token = signAdminToken(admin.id);

      res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
      });

      return res.json({ message: "Login successful" });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
