import { Admin } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

// This empty export is critical: it tells TS this file is a module 
// while the 'declare global' ensures the types actually go global.
export {};