import jwt from "jsonwebtoken";

/**
 * We intentionally fail fast if JWT_SECRET is missing.
 * This prevents the server from running in an insecure state.
 */
const JWT_SECRET: string = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Set it in your backend .env file."
  );
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
