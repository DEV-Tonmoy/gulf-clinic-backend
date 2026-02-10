import { Router, Request, Response, NextFunction } from "express";
import { adminLoginRateLimit } from "../middleware/adminRateLimit";
import { authService } from "../services/auth.service";
import { requireAdmin } from "../middleware/adminAuth"; // ✅ Fixed import path

const router = Router();

// POST /admin/login
router.post(
  "/login",
  adminLoginRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Call the service
      const { token } = await authService.login(email, password);

      // Set cookie
      res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });

      return res.json({ message: "Login successful" });
    } catch (error) {
      next(error);
    }
  }
);

// POST /admin/change-password
// Requires Admin Authentication
router.post(
  "/change-password",
  requireAdmin, // ✅ Protects this route
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;
      
      // ✅ Using req.admin.id to match your middleware's "declare global"
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const adminId = req.admin.id; 

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Both old and new passwords are required" });
      }

      await authService.changePassword(adminId, oldPassword, newPassword);

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// POST /admin/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ message: "Logged out successfully" });
});

export default router;