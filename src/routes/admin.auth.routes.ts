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
         * FIX: Conditional Cookie Settings
         * We only use 'secure' and 'sameSite: none' in production.
         * Localhost cannot handle 'secure: true' over regular HTTP.
         */
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // False on localhost, True on Railway
            sameSite: isProduction ? 'none' : 'lax', // 'lax' is better for local dev
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
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;