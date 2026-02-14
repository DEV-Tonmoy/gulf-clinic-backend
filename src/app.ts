import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRouter from "./routes/health.route";
import appointmentRoutes from "./routes/appointment.routes";
import adminAuthRoutes from "./routes/admin.auth.routes";
import adminTestRoutes from "./routes/admin.test.routes";
import adminSettingsRoutes from "./routes/admin.settings.routes";
import adminDoctorRoutes from "./routes/admin.doctor.routes";
import publicDoctorRoutes from "./routes/public.doctor.routes";
import publicSettingsRoutes from "./routes/public.settings.routes"; 
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();

// Required for secure cookies when deployed behind Render's proxy
app.set("trust proxy", 1); 

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

// ==========================================
// CORS CONFIGURATION
// ==========================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // YOUR LIVE ADMIN FRONTEND URL
  "https://gulfclinic-frontend.onrender.com",
  // Support for future Public Frontend (via Env Var)
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin) return callback(null, true);

    // 2. Check if origin is in our whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } 

    // 3. Permissive in development mode
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // 4. Block if it doesn't match and we are in production
    console.error(`Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// ==========================================
// PUBLIC ROUTES
// ==========================================
app.use("/health", healthRouter);
app.use("/api/public/doctors", publicDoctorRoutes);
app.use("/api/public/settings", publicSettingsRoutes);
app.use("/api/appointments", appointmentRoutes); 

// ==========================================
// ADMIN ROUTES
// ==========================================
// FIX: Using "/admin" instead of "/admin/auth" so that frontend calls to 
// /admin/login and /admin/logout work correctly.
app.use("/admin", adminAuthRoutes); 
app.use("/admin/test", adminTestRoutes);
app.use("/admin/settings", adminSettingsRoutes);
app.use("/admin/doctors", adminDoctorRoutes); 

// Global Error Handler
app.use(errorHandler);

export default app;