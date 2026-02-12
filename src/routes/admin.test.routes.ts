import { Router } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /admin/stats
 * Verifies session and returns admin data for the AuthContext.
 */
router.get('/stats', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ authenticated: false, admin: null });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ authenticated: false, admin: null });

    res.json({ authenticated: true, admin: decoded });
});

/**
 * GET /admin/appointments
 * Fetches all appointments from the AppointmentRequest model.
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
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * PATCH /admin/appointments/:id
 * Updates the status (NEW, CONTACTED, CLOSED).
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
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

/**
 * DELETE /admin/appointments/:id
 * Removes the record from the database.
 */
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.appointmentRequest.delete({
            where: { id }
        });

        res.json({ success: true, message: "Appointment deleted" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete" });
    }
});

export default router;