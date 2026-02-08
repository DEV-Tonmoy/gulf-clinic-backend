import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRouter from "./routes/health.route";
import appointmentRoutes from "./routes/appointment.routes";
import adminAuthRoutes from "./routes/admin.auth.routes";
import adminTestRoutes from "./routes/admin.test.routes";
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
app.use("/appointments", appointmentRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminTestRoutes);

// 3. Global Error Handler (MUST BE LAST)
// This catches all errors passed from next(error) in your routes
app.use(errorHandler);

export default app;