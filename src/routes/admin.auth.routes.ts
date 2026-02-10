import { Router, Request, Response, NextFunction } from "express";
import { adminLoginRateLimit } from "../middleware/adminRateLimit";
import { authService } from "../services/auth.service";
import { requireAdmin } from "../middleware/adminAuth";

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
      // Using 'lax' for sameSite in development allows the cookie to pass between port 5173 and 5000
      res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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
router.post(
  "/change-password",
  requireAdmin, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;
      
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
  // Clear cookie with matching settings
  res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ message: "Logged out successfully" });
});

export default router;