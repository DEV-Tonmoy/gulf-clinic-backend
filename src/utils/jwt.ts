import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Use the environment variable, or a fallback to prevent the Railway boot crash
const JWT_SECRET = process.env.JWT_SECRET || 'gulf_clinic_default_secure_secret_2024';

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ [AUTH]: JWT_SECRET is not defined in Environment Variables. Using fallback.");
}

export const generateToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};