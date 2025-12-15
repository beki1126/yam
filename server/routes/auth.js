// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ================================================================
// NODEMAILER ТОХИРГОО
// ================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Имэйл амжилттай тохируулагдсан эсэхийг шалгах
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// ================================================================
// MIDDLEWARE: Token шалгах
// ================================================================
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Токен байхгүй байна. Нэвтэрнэ үү.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (e) {
        console.error('Token verification error:', e.message);
        return res.status(401).json({ 
            success: false,
            message: 'Токен хүчингүй байна. Дахин нэвтэрнэ үү.' 
        });
    }
};

// ================================================================
// AUTHENTICATION ROUTES
// ================================================================

// ====================================
// POST: Login WITHOUT 2FA (Simplified)
// Route: /api/auth/login
// ====================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Имэйл болон нууц үгээ оруулна уу.' 
        });
    }

    try {
        // Find user in admins table
        const [userRows] = await db.query(
            'SELECT id, email, password, full_name, role, is_active FROM admins WHERE email = ?', 
            [email]
        );
        
        if (userRows.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Имэйл эсвэл нууц үг буруу байна.' 
            }); 
        }

        const user = userRows[0];
        
        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false,
                message: 'Таны эрх идэвхгүй байна. Админтай холбогдоно уу.' 
            });
        }
        
        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ 
                success: false,
                message: 'Имэйл эсвэл нууц үг буруу байна.' 
            });
        }

        // ✅ 2FA УНТРААСАН - Шууд JWT token үүсгэх
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '24h' }
        );
        
        // Update last login
        await db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);
        
        console.log(`✅ User logged in (without 2FA): ${user.email}`);
        
        res.json({
            success: true,
            token: token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            },
            message: 'Амжилттай нэвтэрлээ.'
        });

    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Серверийн алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

// ====================================
// POST: Verify OTP (DISABLED - kept for compatibility)
// Route: /api/auth/verify-otp
// ====================================
router.post('/verify-otp', async (req, res) => {
    res.status(400).json({
        success: false,
        message: '2FA идэвхгүй байна.'
    });
});

// ====================================
// POST: Resend OTP (DISABLED - kept for compatibility)
// Route: /api/auth/resend-otp
// ====================================
router.post('/resend-otp', async (req, res) => {
    res.status(400).json({
        success: false,
        message: '2FA идэвхгүй байна.'
    });
});

// ================================================================
// OTHER AUTH ROUTES
// ================================================================

// GET: Одоогийн хэрэглэгчийн мэдээлэл
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [userRows] = await db.query(
            'SELECT id, email, full_name, role, is_active, last_login, created_at FROM admins WHERE id = ?', 
            [req.userId]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Хэрэглэгч олдсонгүй.' 
            });
        }

        res.json({ success: true, user: userRows[0] });
    } catch (e) {
        console.error('Get user error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Серверийн алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

// POST: Logout
router.post('/logout', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Амжилттай гарлаа.' });
});

// POST: Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Имэйл хаягаа оруулна уу.' });

    try {
        const [userRows] = await db.query('SELECT id, email FROM admins WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.json({ success: true, message: 'Хэрэв имэйл бүртгэлтэй бол сэргээх линк илгээгдсэн.' });
        }

        const user = userRows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;

        await db.query(
            'UPDATE admins SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, user.id]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; 
        const resetURL = `${frontendUrl}/reset-password-confirm/${resetToken}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Audit Portal - Нууц үг сэргээх хүсэлт',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007BFF;">Нууц үг сэргээх</h2>
                    <p>Таны нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх товчийг дарж шинэ нууц үг үүсгэнэ үү:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" style="background-color: #007BFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Нууц үг солих
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Энэхүү линк 1 цагийн дараа хүчингүй болно.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ success: true, message: 'Сэргээх линк таны имэйл рүү амжилттай илгээгдлээ.' });
        } catch (emailError) {
            console.error('Forgot password email error:', emailError);
            res.status(500).json({ 
                success: false,
                message: 'Имэйл илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу.'
            });
        }

    } catch (e) {
        console.error('Forgot password error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Нууц үг сэргээхэд алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

// POST: Reset Password Confirm
router.post('/reset-password-confirm/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Шинэ нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.' });
    }

    try {
        const currentTime = Date.now();
        const [userRows] = await db.query(
            'SELECT id, email FROM admins WHERE reset_password_token = ? AND reset_password_expires > ?',
            [token, currentTime]
        );

        if (userRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Сэргээх линк хүчингүй эсвэл хугацаа нь дууссан байна.' });
        }

        const user = userRows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE admins SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        try {
            await transporter.sendMail({
                to: user.email,
                from: process.env.EMAIL_USER,
                subject: 'Audit Portal - Нууц үг амжилттай солигдлоо',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #28a745;">✅ Нууц үг солигдлоо</h2>
                        <p>Таны нууц үг амжилттай солигдлоо.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Confirmation email error:', emailError.message);
        }

        res.json({ success: true, message: 'Нууц үг амжилттай шинэчлэгдлээ. Та одоо нэвтэрч болно.' });

    } catch (e) {
        console.error('Reset password confirm error:', e);
        res.status(500).json({ 
            success: false,
            message: 'Нууц үг солиход серверийн алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

// GET: Token шалгах
router.get("/check", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ valid: false });

    try {
        jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

// ====================================
// POST: Change Password (Self)
// Route: /api/auth/change-password
// ====================================
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Одоогийн болон шинэ нууц үг оруулна уу.'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Шинэ нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.'
            });
        }
        
        // Get user with current password
        const [userRows] = await db.query(
            'SELECT id, email, password FROM admins WHERE id = ?',
            [req.userId]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Хэрэглэгч олдсонгүй.'
            });
        }
        
        const user = userRows[0];
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Одоогийн нууц үг буруу байна.'
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await db.query(
            'UPDATE admins SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );
        
        console.log(`✅ Password changed for user: ${user.email}`);
        
        res.json({
            success: true,
            message: 'Нууц үг амжилттай солигдлоо.'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Нууц үг солиход алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ================================================================
// EXPORT
// ================================================================
module.exports = router;s
