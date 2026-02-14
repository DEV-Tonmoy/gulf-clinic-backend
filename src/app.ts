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

app.set("trust proxy", 1); 

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://gulfclinic-frontend.onrender.com",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
];

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } 

    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    console.error(`Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200 // Essential for older browsers/preflight success
};

// 1. Apply CORS for all standard requests
app.use(cors(corsOptions));

// 2. NEW: Explicitly handle PREFLIGHT (OPTIONS) requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRouter);
app.use("/api/public/doctors", publicDoctorRoutes);
app.use("/api/public/settings", publicSettingsRoutes);
app.use("/api/appointments", appointmentRoutes); 

app.use("/admin", adminAuthRoutes); 
app.use("/admin/test", adminTestRoutes);
app.use("/admin/settings", adminSettingsRoutes);
app.use("/admin/doctors", adminDoctorRoutes); 
app.use("/admin/management", adminManagementRoutes);

app.use(errorHandler);

export default app;