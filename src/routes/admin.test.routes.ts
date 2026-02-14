import { Router } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /admin/stats
 * Provides dashboard metrics and auth verification.
 */
router.get('/stats', async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, authenticated: false });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, authenticated: false });

    try {
        const total = await prisma.appointmentRequest.count();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const newToday = await prisma.appointmentRequest.count({
            where: { createdAt: { gte: todayStart } }
        });

        // This line caused the error; now it works after Step 1
        const aiHandled = await prisma.appointmentRequest.count({
            where: { isAi: true }
        });

        const closed = await prisma.appointmentRequest.count({
            where: { status: 'CLOSED' }
        });

        const conversionRate = total > 0 ? `${Math.round((closed / total) * 100)}%` : '0%';

        res.json({ 
            success: true, 
            authenticated: true, 
            admin: decoded,
            stats: {
                total,
                newToday,
                aiHandled,
                conversionRate
            }
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching statistics" });
    }
});

/**
 * GET /admin/appointments
 */
router.get('/appointments', async (req, res) => {
    try {
        const { search } = req.query;
        const appointments = await prisma.appointmentRequest.findMany({
            where: search ? {
                OR: [
                    { fullName: { contains: String(search), mode: 'insensitive' } },
                    { phone: { contains: String(search), mode: 'insensitive' } }
                ]
            } : {},
            include: { doctor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * PATCH /admin/appointments/:id
 */
router.patch('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.appointmentRequest.update({
            where: { id },
            data: { status }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
});

/**
 * DELETE /admin/appointments/:id
 */
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointmentRequest.delete({ where: { id } });
        res.json({ success: true, message: "Appointment deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
});

export default router;