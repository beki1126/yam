// server/routes/audit.js
const express = require('express');
const router = express.Router();
const db = require('../db/db');
const jwt = require('jsonwebtoken');

// ================================================================
// MIDDLEWARE: Token шалгах
// ================================================================
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Токен байхгүй байна. Нэвтэрнэ үү.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Токен хүчингүй байна. Дахин нэвтэрнэ үү.' });
    }
};

// ================================================================
// СТАНДАРТ
// ================================================================

// GET: Бүх стандарт
router.get('/standards', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM standards 
            WHERE is_active = TRUE 
            ORDER BY code ASC
        `);
        res.json({ 
            success: true,
            standards: rows 
        });
    } catch (e) {
        console.error('Get standards error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Стандарт татахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

// ================================================================
// АУДИТ - CRUD
// ================================================================

// GET: Бүх аудит (Pagination, Filter, Search)
router.get('/audits', verifyToken, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            status, 
            certificate_status,
            search, 
            standard_id, 
            organization_id,
            expiry_filter // 'all', 'expired', 'expiring_soon', 'active'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let queryParams = [];
        
        // Төлөв
        if (status) {
            whereConditions.push('a.status = ?');
            queryParams.push(status);
        }
        
        // Сертификатын төлөв
        if (certificate_status) {
            whereConditions.push('a.certificate_status = ?');
            queryParams.push(certificate_status);
        }
        
        // Стандарт
        if (standard_id) {
            whereConditions.push('a.standard_id = ?');
            queryParams.push(standard_id);
        }
        
        // Байгууллага
        if (organization_id) {
            whereConditions.push('a.organization_id = ?');
            queryParams.push(organization_id);
        }
        
        // ✅ ЗАСВАР: location устгасан, address хайна
        if (search) {
            whereConditions.push('(o.name LIKE ? OR a.certificate_number LIKE ? OR s.code LIKE ? OR a.address LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        // Эрх дууссан шүүлт
        if (expiry_filter === 'expired') {
            whereConditions.push('a.certificate_expiry_date < CURDATE()');
        } else if (expiry_filter === 'expiring_soon') {
            whereConditions.push('DATEDIFF(a.certificate_expiry_date, CURDATE()) BETWEEN 0 AND 30');
        } else if (expiry_filter === 'active') {
            whereConditions.push('a.certificate_expiry_date >= CURDATE()');
        }
        
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Нийт тоо
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total
            FROM audits a
            JOIN organizations o ON a.organization_id = o.id
            JOIN standards s ON a.standard_id = s.id
            ${whereClause}
        `, queryParams);
        
        const total = countResult[0].total;
        
        // Өгөгдөл татах
        const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];
        
        const [rows] = await db.query(`
            SELECT 
                a.*,
                o.name as organization_name,
                o.registration_number as org_reg_number,
                o.type as org_type,
                s.code as standard_code,
                s.name as standard_name,
                s.category as standard_category,
                DATEDIFF(a.certificate_expiry_date, CURDATE()) as days_until_expiry,
                CASE 
                    WHEN a.certificate_expiry_date < CURDATE() THEN 'expired'
                    WHEN DATEDIFF(a.certificate_expiry_date, CURDATE()) BETWEEN 0 AND 30 THEN 'expiring_soon'
                    ELSE 'active'
                END as expiry_status
            FROM audits a
            JOIN organizations o ON a.organization_id = o.id
            JOIN standards s ON a.standard_id = s.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `, dataParams);
        
        res.json({ 
            success: true,
            audits: rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        console.error('Get audits error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Аудит татахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

// GET: Нэг аудитын дэлгэрэнгүй
router.get('/audits/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.query(`
            SELECT 
                a.*,
                o.name as organization_name,
                o.name_en as organization_name_en,
                o.registration_number as org_reg_number,
                o.type as org_type,
                o.address as org_address,
                o.phone as org_phone,
                o.email as org_email,
                o.website as org_website,
                s.code as standard_code,
                s.name as standard_name,
                s.name_en as standard_name_en,
                s.category as standard_category,
                DATEDIFF(a.certificate_expiry_date, CURDATE()) as days_until_expiry
            FROM audits a
            JOIN organizations o ON a.organization_id = o.id
            JOIN standards s ON a.standard_id = s.id
            WHERE a.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Аудит олдсонгүй.' 
            });
        }
        
        res.json({ 
            success: true,
            audit: rows[0] 
        });
    } catch (e) {
        console.error('Get audit detail error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Аудитын дэлгэрэнгүй татахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

// POST: Шинэ аудит нэмэх
router.post('/audits', verifyToken, async (req, res) => {
    const {
        organization_id,
        standard_id,
        audit_start_date,
        audit_end_date,
        certificate_issue_date,
        certificate_expiry_date,
        certificate_number,
        certificate_status,
        certificate_issuer,
        auditor_name,
        auditor_registration,
        contact_phone,
        contact_email,
        address,  // ✅ ЗАСВАР: location → address
        notes,
        status
    } = req.body;
    
    // Validation
    if (!organization_id || !standard_id) {
        return res.status(400).json({ 
            success: false,
            message: 'Байгууллага болон Стандарт заавал оруулна уу.' 
        });
    }
    
    try {
        // ✅ ЗАСВАР: location устгасан, address нэмсэн
        const [result] = await db.query(`
            INSERT INTO audits (
                organization_id, standard_id, audit_start_date, audit_end_date,
                certificate_issue_date, certificate_expiry_date, certificate_number,
                certificate_status, certificate_issuer, auditor_name, auditor_registration,
                contact_phone, contact_email, address, notes, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            organization_id, 
            standard_id, 
            audit_start_date || null, 
            audit_end_date || null,
            certificate_issue_date || null, 
            certificate_expiry_date || null, 
            certificate_number || null,
            certificate_status || 'Хүчинтэй', 
            certificate_issuer || null, 
            auditor_name || null, 
            auditor_registration || null, 
            contact_phone || null, 
            contact_email || null, 
            address || null,  // ✅ ЗАСВАР: location → address
            notes || null, 
            status || 'Дууссан', 
            req.userId
        ]);
        
        res.status(201).json({ 
            success: true,
            message: 'Аудит амжилттай нэмэгдлээ.',
            audit_id: result.insertId 
        });
    } catch (e) {
        console.error('Create audit error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Аудит нэмэхэд алдаа гарлаа.',
            error: e.message 
        });
    }
});

// PUT: Аудит шинэчлэх
router.put('/audits/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    try {
        // Аудит байгаа эсэхийг шалгах
        const [existing] = await db.query('SELECT id FROM audits WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Аудит олдсонгүй.' 
            });
        }
        
        // ✅ ЗАСВАР: Зөвшөөрөгдсөн талбарууд - location → address
        const allowedFields = [
            'organization_id', 'standard_id', 'audit_start_date', 'audit_end_date',
            'certificate_issue_date', 'certificate_expiry_date', 'certificate_number',
            'certificate_status', 'certificate_issuer', 'auditor_name', 'auditor_registration',
            'contact_phone', 'contact_email', 'address', 'notes', 'status'
        ];
        
        const fields = Object.keys(updateData).filter(key => allowedFields.includes(key));
        
        if (fields.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Шинэчлэх өгөгдөл байхгүй байна.' 
            });
        }
        
        const values = fields.map(key => updateData[key]);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        values.push(req.userId, id);
        
        await db.query(`
            UPDATE audits 
            SET ${setClause}, updated_by = ?
            WHERE id = ?
        `, values);
        
        res.json({ 
            success: true,
            message: 'Аудит амжилттай шинэчлэгдлээ.' 
        });
    } catch (e) {
        console.error('Update audit error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Аудит шинэчлэхэд алдаа гарлаа.',
            error: e.message 
        });
    }
});

// DELETE: Аудит устгах
router.delete('/audits/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [existing] = await db.query('SELECT id FROM audits WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Аудит олдсонгүй.' 
            });
        }
        
        await db.query('DELETE FROM audits WHERE id = ?', [id]);
        
        res.json({ 
            success: true,
            message: 'Аудит амжилттай устгагдлаа.' 
        });
    } catch (e) {
        console.error('Delete audit error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Аудит устгахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

// ================================================================
// СТАТИСТИК & DASHBOARD
// ================================================================

// GET: Dashboard статистик
router.get('/stats/dashboard', verifyToken, async (req, res) => {
    try {
        // Нийт аудит
        const [totalAudits] = await db.query('SELECT COUNT(*) as count FROM audits');
        
        // Хүчинтэй сертификат
        const [activeCerts] = await db.query(`
            SELECT COUNT(*) as count FROM audits 
            WHERE certificate_status = 'Хүчинтэй' 
            AND certificate_expiry_date >= CURDATE()
        `);
        
        // Эрх дууссан
        const [expiredCerts] = await db.query(`
            SELECT COUNT(*) as count FROM audits 
            WHERE certificate_expiry_date < CURDATE()
        `);
        
        // Удахгүй дуусах (30 хоногийн дотор)
        const [expiringSoon] = await db.query(`
            SELECT COUNT(*) as count FROM audits 
            WHERE DATEDIFF(certificate_expiry_date, CURDATE()) BETWEEN 0 AND 30
        `);
        
        // Байгууллагын тоо
        const [orgCount] = await db.query('SELECT COUNT(*) as count FROM organizations WHERE is_active = TRUE');
        
        // Стандартын статистик
        const [standardStats] = await db.query(`
            SELECT 
                s.code,
                s.name,
                COUNT(a.id) as audit_count
            FROM standards s
            LEFT JOIN audits a ON s.id = a.standard_id
            WHERE s.is_active = TRUE
            GROUP BY s.id
            ORDER BY audit_count DESC
            LIMIT 5
        `);
        
        res.json({
            success: true,
            stats: {
                total_audits: totalAudits[0].count,
                active_certificates: activeCerts[0].count,
                expired_certificates: expiredCerts[0].count,
                expiring_soon: expiringSoon[0].count,
                total_organizations: orgCount[0].count
            },
            top_standards: standardStats
        });
    } catch (e) {
        console.error('Dashboard stats error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Статистик татахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

// GET: Эрх дуусах гэж буй сертификатууд
router.get('/stats/expiring', verifyToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const [rows] = await db.query(`
            SELECT 
                a.id,
                a.certificate_number,
                a.certificate_expiry_date,
                DATEDIFF(a.certificate_expiry_date, CURDATE()) as days_left,
                o.name as organization_name,
                s.code as standard_code,
                s.name as standard_name
            FROM audits a
            JOIN organizations o ON a.organization_id = o.id
            JOIN standards s ON a.standard_id = s.id
            WHERE DATEDIFF(a.certificate_expiry_date, CURDATE()) BETWEEN 0 AND 30
            ORDER BY a.certificate_expiry_date ASC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({ 
            success: true,
            expiring_audits: rows 
        });
    } catch (e) {
        console.error('Expiring audits error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Эрх дуусах аудит татахад алдаа гарлаа.',
            error: e.message 
        });
    }
});

module.exports = router;