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
import adminManagementRoutes from "./routes/admin.management.routes";
import publicDoctorRoutes from "./routes/public.doctor.routes";
import publicSettingsRoutes from "./routes/public.settings.routes"; 
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();

// 1. GLOBAL SETTINGS
app.set("trust proxy", 1); 

// 2. CORS CONFIGURATION (Must be at the very top)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://gulfclinic-frontend.onrender.com",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or if origin is in whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200 // Responds with 200 instead of 204 for preflight success
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Explicitly handle all preflight (OPTIONS) requests globally
app.options("*", cors(corsOptions));

// 3. REMAINING MIDDLEWARE
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cookieParser());

// 4. ROUTE DEFINITIONS
app.use("/health", healthRouter);
app.use("/api/public/doctors", publicDoctorRoutes);
app.use("/api/public/settings", publicSettingsRoutes);
app.use("/api/appointments", appointmentRoutes); 

app.use("/admin", adminAuthRoutes); 
app.use("/admin/test", adminTestRoutes);
app.use("/admin/settings", adminSettingsRoutes);
app.use("/admin/doctors", adminDoctorRoutes); 
app.use("/admin/management", adminManagementRoutes);

// 5. ERROR HANDLING (Must be at the bottom)
app.use(errorHandler);

export default app;