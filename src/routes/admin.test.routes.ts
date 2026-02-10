import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

/**
 * GET /admin/verify
 * This is the "Heartbeat" of your authentication.
 * The frontend calls this to see if the 'token' cookie is valid.
 */
router.get('/verify', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("Verification failed: No token found in cookies.");
        return res.status(401).json({ authenticated: false, message: "No session found" });
    }

    try {
        // Verify the token using the secret from your environment variables
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // If successful, tell the frontend they are good to go
        res.json({ 
            authenticated: true, 
            admin: decoded 
        });
    } catch (error) {
        console.error("Verification failed: Invalid or expired token.");
        res.status(401).json({ authenticated: false, message: "Session expired" });
    }
});

export default router;