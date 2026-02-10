import { Router } from 'express';
import { generateToken } from '../utils/jwt';

const router = Router();

// POST /admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // --- ADD YOUR DATABASE CHECK HERE ---
        // For now, we assume login is successful:
        const admin = { id: '1', email, role: 'ADMIN' };
        const token = generateToken(admin);

        // CRITICAL FOR RAILWAY: 
        // We must set secure: true and sameSite: 'none' for HTTPS
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Must be true for Railway (HTTPS)
            sameSite: 'none', // Must be 'none' for cross-domain cookies
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Logged in successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

export default router;