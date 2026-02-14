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

// Required for secure cookies when deployed (Railway/Render use proxies)
app.set("trust proxy", 1); 

app.use(helmet());

// These are the URLs of the FRONTEND that are allowed to access this Backend
const allowedOrigins = [
  "http://localhost:3000", // Default React local port
  "http://localhost:5173", // Default Vite/Lovable local port
  ...(process.env.ALLOWED_ORIGINS?.split(",") || [])
];

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if in dev mode
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required to accept cookies from the dashboard
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
app.use("/health", healthRouter);
app.use("/api/public/doctors", publicDoctorRoutes);
app.use("/api/public/settings", publicSettingsRoutes);
app.use("/api/appointments", appointmentRoutes); // Patient booking endpoint

// ==========================================
// ADMIN ROUTES (Auth Required via Middleware)
// ==========================================
app.use("/admin/auth", adminAuthRoutes);
app.use("/admin/test", adminTestRoutes);
app.use("/admin/settings", adminSettingsRoutes);
app.use("/admin/doctors", adminDoctorRoutes); 
app.use("/admin/appointments", appointmentRoutes); // Admin viewing/updating bookings

// Global Error Handler
app.use(errorHandler);

export default app;