import { Request, Response, NextFunction } from "express";

type RateLimitEntry = {
  count: number;
  firstAttemptAt: number;
};

const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_IP = 3;   // Strict: Only 3 requests per hour

const intakeAttempts = new Map<string, RateLimitEntry>();

export function publicIntakeRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
  const now = Date.now();
  const record = intakeAttempts.get(ip);

  if (!record || (now - record.firstAttemptAt > WINDOW_MS)) {
    intakeAttempts.set(ip, { count: 1, firstAttemptAt: now });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
    return res.status(429).json({
      message: "Too many appointment requests. Please try again later or call the clinic directly.",
    });
  }

  record.count += 1;
  intakeAttempts.set(ip, record);
  next();
}