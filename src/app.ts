import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRouter from "./routes/health.route";
import appointmentRoutes from "./routes/appointment.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/appointments", appointmentRoutes);

export default app;
