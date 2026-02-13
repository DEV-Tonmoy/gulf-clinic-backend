import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_SERVER_ERROR";

  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    
    // Fixed: Zod uses .issues, which contains the array we need to map over
    message = err.issues
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
  } 
  // 2. Handle Prisma Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    code = `PRISMA_${err.code}`;
    message = "Database operation failed";
  }

  // Consistent JSON response for your SaaS frontend
  res.status(statusCode).json({
    message,
    code,
  });
};