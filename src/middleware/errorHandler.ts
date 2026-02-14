import * as express from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_SERVER_ERROR";

  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    
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

  // Log error for server debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${code}: ${message}`, err);
  }

  // Consistent JSON response for your frontend
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};