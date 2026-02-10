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

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173",
  ...(process.env.ALLOWED_ORIGINS?.split(",") || [])
];

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/health", healthRouter);
app.use("/appointments", appointmentRoutes); 
app.use("/admin", adminAuthRoutes); // Login logic is here
app.use("/admin", adminTestRoutes); // Protected stats/appointments are here

app.use(errorHandler);

export default app;