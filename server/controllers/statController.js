// server/controllers/statController.js
const pool = require('../db/db'); 

/**
 * Dashboard-ийн статистик мэдээллийг татах
 * GET /api/stats/dashboard
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Бүх query-г зэрэг ажиллуулж хурд нэмэгдүүлэх
        const [
            [totalAudits],
            [totalOrgs],
            [expiringSoon],
            [activeCertificates]
        ] = await Promise.all([
            pool.query(`
                SELECT COUNT(id) AS total_audits 
                FROM audits 
                WHERE deleted_at IS NULL
            `),
            pool.query(`
                SELECT COUNT(id) AS total_organizations 
                FROM organizations 
                WHERE deleted_at IS NULL AND is_active = 1
            `),
            pool.query(`
                SELECT COUNT(id) AS expiring_soon_certificates 
                FROM expired_certificates
            `),
            pool.query(`
                SELECT COUNT(id) AS active_certificates 
                FROM audits 
                WHERE certificate_status = 'Хүчинтэй' 
                  AND deleted_at IS NULL
            `)
        ]);

        res.status(200).json({
            total_audits: totalAudits[0].total_audits,
            total_organizations: totalOrgs[0].total_organizations,
            expiring_soon: expiringSoon[0].expiring_soon_certificates,
            active_certificates: activeCertificates[0].active_certificates
        });

    } catch (error) {
        console.error("Dashboard статистик татахад алдаа гарлаа:", error);
        res.status(500).json({ 
            message: 'Серверийн алдаа: Статистик мэдээлэл татаж чадсангүй.', 
            details: error.message 
        });
    }
};