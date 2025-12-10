// ====================================
// ORGANIZATIONS ROUTES - UPDATED
// File: server/routes/orgs.js
// ====================================

const express = require('express');
const router = express.Router();
const db = require('../db/db');

// ====================================
// 🆕 HELPER FUNCTIONS - Certificate Validation
// ====================================

/**
 * Сертификатын огнооны формат шалгах
 * @param {string} dateString - "2025-12-05 | 2025-12-26" формат
 * @returns {boolean} - Бүх огноо зөв бол true
 */
function validateCertificateDates(dateString) {
    if (!dateString) return true;
    
    const dates = dateString.split('|').map(d => d.trim()).filter(d => d);
    
    if (dates.length === 0) return true;
    
    for (const date of dates) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            console.log(`❌ Invalid date format: ${date}`);
            return false;
        }
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            console.log(`❌ Invalid date value: ${date}`);
            return false;
        }
    }
    
    return true;
}

/**
 * 🆕 Сертификат давхардал шалгах
 * @param {string} certificates - "ISO 27001:2022 Lead Auditor | ISO 9001"
 * @param {number} excludeOrgId - Шалгахаас хасах байгууллагын ID (update үед)
 * @returns {Promise<Object>} - { isDuplicate: boolean, duplicateOrg: string }
 */
async function checkDuplicateCertificates(certificates, excludeOrgId = null) {
    if (!certificates || certificates.trim() === '') {
        return { isDuplicate: false };
    }
    
    // Сертификатуудыг array болгох
    const certArray = certificates.split('|')
        .map(c => c.trim())
        .filter(c => c.length > 0);
    
    if (certArray.length === 0) {
        return { isDuplicate: false };
    }
    
    try {
        // Бүх байгууллагуудын сертификатуудыг татах
        let query = 'SELECT id, org_name, certificates FROM organizations WHERE deleted_at IS NULL';
        const params = [];
        
        if (excludeOrgId) {
            query += ' AND id != ?';
            params.push(excludeOrgId);
        }
        
        const [orgs] = await db.query(query, params);
        
        // Давхардсан сертификат шалгах
        for (const org of orgs) {
            if (!org.certificates) continue;
            
            const existingCerts = org.certificates.split('|')
                .map(c => c.trim())
                .filter(c => c.length > 0);
            
            // Давхардсан сертификат олох
            for (const cert of certArray) {
                if (existingCerts.includes(cert)) {
                    return {
                        isDuplicate: true,
                        duplicateOrg: org.org_name,
                        duplicateCert: cert
                    };
                }
            }
        }
        
        return { isDuplicate: false };
        
    } catch (error) {
        console.error('❌ checkDuplicateCertificates error:', error);
        throw error;
    }
}

/**
 * 🆕 Албан хаагч давхардал шалгах
 * @param {string} contactPerson - "Б.Батхүү | Л.Мөнхзул"
 * @param {number} excludeOrgId - Шалгахаас хасах байгууллагын ID
 * @returns {Promise<Object>} - { isDuplicate: boolean, duplicateOrg: string }
 */
async function checkDuplicateEmployees(contactPerson, excludeOrgId = null) {
    if (!contactPerson || contactPerson.trim() === '') {
        return { isDuplicate: false };
    }
    
    // Албан хаагчдыг array болгох
    const employees = contactPerson.split('|')
        .map(e => e.trim())
        .filter(e => e.length > 0);
    
    if (employees.length === 0) {
        return { isDuplicate: false };
    }
    
    try {
        // Бүх байгууллагуудын албан хаагчдыг татах
        let query = 'SELECT id, org_name, contact_person FROM organizations WHERE deleted_at IS NULL';
        const params = [];
        
        if (excludeOrgId) {
            query += ' AND id != ?';
            params.push(excludeOrgId);
        }
        
        const [orgs] = await db.query(query, params);
        
        // Давхардсан албан хаагч шалгах
        for (const org of orgs) {
            if (!org.contact_person) continue;
            
            const existingEmployees = org.contact_person.split('|')
                .map(e => e.trim())
                .filter(e => e.length > 0);
            
            // Давхардсан албан хаагч олох
            for (const emp of employees) {
                if (existingEmployees.includes(emp)) {
                    return {
                        isDuplicate: true,
                        duplicateOrg: org.org_name,
                        duplicateEmployee: emp
                    };
                }
            }
        }
        
        return { isDuplicate: false };
        
    } catch (error) {
        console.error('❌ checkDuplicateEmployees error:', error);
        throw error;
    }
}

// ✅ Middleware шалгах функц
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Нэвтрэх шаардлагатай.'
        });
    }
    
    next();
};

// ====================================
// GET: Бүх байгууллага
// ====================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const { q, license_type } = req.query;
        
        let query = `
            SELECT 
                id,
                org_name,
                registration_number,
                license_type,
                license_expire_date,
                license_numbers,
                certificates,
                cert_expire_date,
                contact_person,
                contact_phone,
                email,
                address,
                reporting_org,
                attachment_filename,
                created_at,
                updated_at
            FROM organizations
            WHERE deleted_at IS NULL
        `;
        
        const params = [];
        
        if (q) {
            query += ` AND (
                org_name LIKE ? OR 
                registration_number LIKE ? OR 
                address LIKE ?
            )`;
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (license_type && license_type !== 'All') {
            query += ` AND FIND_IN_SET(?, license_type) > 0`;
            params.push(license_type);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const [rows] = await db.query(query, params);
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('GET organizations error:', error);
        res.status(500).json({
            success: false,
            message: 'Байгууллагын жагсаалт татахад алдаа гарлаа.',
            error: error.message
        });
    }
});

// ====================================
// GET: Нэг байгууллага
// ====================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM organizations WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Байгууллага олдсонгүй.'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('GET organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Байгууллага татахад алдаа гарлаа.',
            error: error.message
        });
    }
});

// ====================================
// POST: Шинэ байгууллага
// ====================================
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            org_name,
            registration_number,
            license_type,
            license_expire_date,
            license_numbers,
            certificates,
            cert_expire_date,
            contact_person,
            contact_phone,
            email,
            address,
            reporting_org,
            attachment_filename
        } = req.body;
        
        // ✅ Validation: Байгууллагын нэр
        if (!org_name || org_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Байгууллагын нэр заавал оруулна уу.'
            });
        }
        
        // ✅ Validation: cert_expire_date формат шалгах
        if (cert_expire_date && !validateCertificateDates(cert_expire_date)) {
            return res.status(400).json({
                success: false,
                message: 'Сертификатын огнооны формат буруу байна. YYYY-MM-DD формат ашиглана уу. Олон огноо бол | -аар тусгаарлана.'
            });
        }
        
        // 🆕 Validation: Сертификат давхардал шалгах
        if (certificates) {
            const certCheck = await checkDuplicateCertificates(certificates);
            if (certCheck.isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: `Сертификат "${certCheck.duplicateCert}" аль хэдийн "${certCheck.duplicateOrg}" байгууллагад бүртгэгдсэн байна!`
                });
            }
        }
        
        // ❌ Албан хаагч давхардал шалгах ХАСАГДСАН
        // Албан хаагч олон байгууллагад ажиллаж болно
        
        // license_type array → string
        const licenseTypeString = Array.isArray(license_type) 
            ? license_type.join(',') 
            : license_type || '';
        
        console.log('💾 Creating organization with validations passed');
        
        const [result] = await db.query(
            `INSERT INTO organizations (
                org_name,
                registration_number,
                license_type,
                license_expire_date,
                license_numbers,
                certificates,
                cert_expire_date,
                contact_person,
                contact_phone,
                email,
                address,
                reporting_org,
                attachment_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                org_name,
                registration_number || null,
                licenseTypeString,
                license_expire_date || null,
                license_numbers || null,
                certificates || null,
                cert_expire_date || null,
                contact_person || null,
                contact_phone || null,
                email || null,
                address || null,
                reporting_org || null,
                attachment_filename || null
            ]
        );
        
        // Шинээр үүссэн байгууллага буцаах
        const [newOrg] = await db.query(
            'SELECT * FROM organizations WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Байгууллага амжилттай нэмэгдлээ.',
            data: newOrg[0]
        });
        
    } catch (error) {
        console.error('POST organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Байгууллага нэмэхэд алдаа гарлаа.',
            error: error.message
        });
    }
});

// ====================================
// PUT: Байгууллага шинэчлэх
// ====================================
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Байгууллага байгаа эсэхийг шалгах
        const [existing] = await db.query(
            'SELECT * FROM organizations WHERE id = ? AND deleted_at IS NULL',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Байгууллага олдсонгүй.'
            });
        }
        
        // ✅ Validation: cert_expire_date формат шалгах
        if (req.body.cert_expire_date && !validateCertificateDates(req.body.cert_expire_date)) {
            return res.status(400).json({
                success: false,
                message: 'Сертификатын огнооны формат буруу байна. YYYY-MM-DD формат ашиглана уу. Олон огноо бол | -аар тусгаарлана.'
            });
        }
        
        // 🆕 Validation: Сертификат давхардал шалгах
        if (req.body.certificates) {
            const certCheck = await checkDuplicateCertificates(req.body.certificates, id);
            if (certCheck.isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: `Сертификат "${certCheck.duplicateCert}" аль хэдийн "${certCheck.duplicateOrg}" байгууллагад бүртгэгдсэн байна!`
                });
            }
        }
        
        // ❌ Албан хаагч давхардал шалгах ХАСАГДСАН
        // Албан хаагч олон байгууллагад ажиллаж болно
        
        // ✅ Зөвхөн ирсэн талбаруудыг шинэчлэх
        const allowedFields = [
            'org_name',
            'registration_number',
            'license_type',
            'license_expire_date',
            'license_numbers',
            'certificates',
            'cert_expire_date',
            'contact_person',
            'contact_phone',
            'email',
            'address',
            'reporting_org',
            'attachment_filename'
        ];
        
        const updates = [];
        const values = [];
        
        for (const field of allowedFields) {
            if (req.body.hasOwnProperty(field)) {
                let value = req.body[field];
                
                // license_type array → string
                if (field === 'license_type' && Array.isArray(value)) {
                    value = value.join(',');
                }
                
                // Empty string → null
                if (value === '') {
                    value = null;
                }
                
                updates.push(`${field} = ?`);
                values.push(value);
            }
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Шинэчлэх талбар байхгүй байна.'
            });
        }
        
        // updated_at нэмэх
        updates.push('updated_at = NOW()');
        values.push(id);
        
        const query = `UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`;
        
        await db.query(query, values);
        
        // Шинэчлэгдсэн байгууллага буцаах
        const [updated] = await db.query(
            'SELECT * FROM organizations WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Байгууллага амжилттай шинэчлэгдлээ.',
            data: updated[0]
        });
        
    } catch (error) {
        console.error('PUT organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Байгууллага шинэчлэхэд алдаа гарлаа.',
            error: error.message
        });
    }
});

// ====================================
// DELETE: Байгууллага устгах (HARD DELETE)
// ====================================
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        const [existing] = await db.query(
            'SELECT * FROM organizations WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Байгууллага олдсонгүй.'
            });
        }
        
        const [result] = await db.query(
            'DELETE FROM organizations WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Байгууллага устгахад алдаа гарлаа.'
            });
        }
        
        res.json({
            success: true,
            message: 'Байгууллага бүрмөсөн устгагдлаа.',
            warning: 'Энэ үйлдлийг буцаах боломжгүй!'
        });
        
    } catch (error) {
        console.error('DELETE organization error:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({
                success: false,
                message: 'Энэ байгууллагад холбогдсон аудит бичлэгүүд байна. Эхлээд тэдгээрийг устгана уу.',
                error: 'Foreign key constraint failed'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Байгууллага устгахад алдаа гарлаа.',
            error: error.message
        });
    }
});

module.exports = router;