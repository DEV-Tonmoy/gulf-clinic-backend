import { Router } from 'express';
import { signAdminToken } from '../utils/jwt';

const router = Router();

// POST /admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // --- DATABASE CHECK (Placeholder) ---
        // Replace this with your Prisma check later.
        const admin = { id: '1', email, role: 'ADMIN' };
        
        // Generate the JWT token using your utility
        const token = signAdminToken(admin.id);

        /**
         * CRITICAL FOR RAILWAY & CROSS-DOMAIN:
         * 1. httpOnly: Prevents XSS attacks.
         * 2. secure: true: Required because Railway uses HTTPS.
         * 3. sameSite: 'none': Required because Frontend and Backend have different URLs.
         */
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, 
            sameSite: 'none', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        console.log(`Successfully logged in: ${email}`);
        res.json({ 
            success: true,
            message: 'Logged in successfully', 
            admin 
        });

    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            success: false,
            message: 'Login failed internal server error' 
        });
    }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;