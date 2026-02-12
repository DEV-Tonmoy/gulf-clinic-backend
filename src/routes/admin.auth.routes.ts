import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { signAdminToken } from '../utils/jwt';
import bcrypt from 'bcrypt'; // You have this in your package.json

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find real admin in database
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        // 2. Validate existence and password
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }
        
        // 3. Sign token with REAL database role (ADMIN or SUPER_ADMIN)
        const token = signAdminToken(admin.id, admin.role);
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, 
            sameSite: isProduction ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        console.log(`[AUTH] Login success: ${email} (${admin.role})`);
        
        res.json({ 
            success: true,
            message: 'Logged in successfully', 
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

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