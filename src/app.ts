import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRouter from "./routes/health.route";
import appointmentRoutes from "./routes/appointment.routes";
import adminAuthRoutes from "./routes/admin.auth.routes";
import adminTestRoutes from "./routes/admin.test.routes";
import adminManagementRoutes from "./routes/admin.management.routes"; // ✅ Newly added
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// 1. Production Security Headers
app.use(helmet());

// 2. Controlled CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Thunder Client)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/health", healthRouter);
app.use("/appointments", appointmentRoutes); // Public intake
app.use("/admin", adminAuthRoutes);           // Login, Logout, Password
app.use("/admin", adminTestRoutes);           // Testing tools
app.use("/admin", adminManagementRoutes);      // ✅ Management (Stats, Appointments List, Delete)

// 3. Global Error Handler (MUST BE LAST)
app.use(errorHandler);

export default app;