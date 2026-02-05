import { Request, Response, NextFunction } from "express";

type RateLimitEntry = {
  count: number;
  firstAttemptAt: number;
};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// In-memory store (OK for now)
const attempts = new Map<string, RateLimitEntry>();

export function adminLoginRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString() ||
    "unknown";

  const now = Date.now();
  const record = attempts.get(ip);

  // First attempt
  if (!record) {
    attempts.set(ip, {
      count: 1,
      firstAttemptAt: now,
    });
    return next();
  }

  // Reset window if expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(ip, {
      count: 1,
      firstAttemptAt: now,
    });
    return next();
  }

  // Too many attempts
  if (record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many login attempts. Please try again later.",
    });
  }

  // Increment count
  record.count += 1;
  attempts.set(ip, record);

  next();
}
