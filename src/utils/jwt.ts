import jwt from "jsonwebtoken";

/**
 * We try to get the JWT_SECRET from environment variables.
 * If it's missing (like during a deployment issue), we use a fallback 
 * to prevent the server from crashing.
 */
const JWT_SECRET: string = process.env.JWT_SECRET || "fallback_secret_for_dev_only_123";

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET environment variable is missing. Using fallback secret.");
}

export function signAdminToken(adminId: string) {
  return jwt.sign(
    { adminId },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

// Adding the verify function as well to ensure total compatibility
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};