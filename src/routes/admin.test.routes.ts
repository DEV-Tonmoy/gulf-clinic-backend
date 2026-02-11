import { Router } from 'express';
import { verifyToken } from '../utils/jwt';

const router = Router();

/**
 * GET /admin/stats (Matches what useAuth.ts is calling)
 * This acts as the session verification and returns admin data.
 */
router.get('/stats', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("Verification failed: No token found in cookies.");
        return res.status(401).json({ 
            authenticated: false, 
            admin: null, 
            message: "No session found" 
        });
    }

    // Use your existing verifyToken utility
    const decoded = verifyToken(token);

    if (!decoded) {
        console.error("Verification failed: Invalid or expired token.");
        return res.status(401).json({ 
            authenticated: false, 
            admin: null, 
            message: "Session expired" 
        });
    }

    // Success: Return the admin object just like useAuth expects
    res.json({ 
        authenticated: true, 
        admin: decoded 
    });
});

export default router;