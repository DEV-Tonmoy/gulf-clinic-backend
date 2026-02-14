import * as express from "express";

type RateLimitEntry = {
  count: number;
  firstAttemptAt: number;
};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, RateLimitEntry>();

export function adminLoginRateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString() ||
    "unknown";

  const now = Date.now();
  const record = attempts.get(ip);

  if (!record) {
    attempts.set(ip, {
      count: 1,
      firstAttemptAt: now,
    });
    return next();
  }

  if (now - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(ip, {
      count: 1,
      firstAttemptAt: now,
    });
    return next();
  }

  if (record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
    });
  }

  record.count += 1;
  attempts.set(ip, record);

  next();
}