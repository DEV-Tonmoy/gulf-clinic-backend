import { Router, Request, Response, NextFunction } from "express";
import { appointmentRequestSchema } from "../validators";
import { publicIntakeRateLimit } from "../middleware/publicRateLimit";
import { appointmentService } from "../services/appointment.service";

const router = Router();

// POST /appointments/request
router.post(
  "/request", 
  publicIntakeRateLimit, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate input using your Zod schema
      const validatedData = appointmentRequestSchema.parse(req.body);

      // 2. Use the service to save to DB
      const newRequest = await appointmentService.createAppointment(validatedData);

      // 3. Return response
      return res.status(201).json({
        message: "Appointment request submitted successfully.",
        referenceId: newRequest.id,
        status: newRequest.status
      });

    } catch (error) {
      // Passes Zod validation errors or DB errors to Global Error Handler
      next(error);
    }
  }
);

export default router;