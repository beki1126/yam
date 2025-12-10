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
// POST: Login with 2FA
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

        // 🔐 2FA: Generate 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 600000); // 10 minutes
        
        // Save OTP to database
        await db.query(
            `UPDATE admins 
             SET otp_code = ?, 
                 otp_expires = ? 
             WHERE id = ?`,
            [otpCode, otpExpires, user.id]
        );
        
        // Send OTP email
        const mailOptions = {
            from: '"МЕА Систем" <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: 'Баталгаажуулах код - МЕА Систем',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #053B50 0%, #007BFF 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9f9f9; }
        .otp-box { background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3); }
        .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 30px; background: #f5f5f5; color: #666; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Баталгаажуулах Код</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 10px;">
                Сайн байна уу, <strong>${user.full_name || 'Хэрэглэгч'}</strong>!
            </p>
            <p>Та МЕА системд нэвтрэх гэж байна. Доорх баталгаажуулах кодыг оруулна уу:</p>
            <div class="otp-box">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Таны баталгаажуулах код:</p>
                <div class="otp-code">${otpCode}</div>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Кодыг системд оруулна уу</p>
            </div>
            <div class="info-box">
                <p style="margin: 0; font-size: 14px;">
                    <strong>📌 Анхаар:</strong> Энэ код <strong>10 минутын</strong> дараа хүчингүй болно.
                </p>
            </div>
            <div class="warning">
                <p style="margin: 0; font-size: 14px;">
                    <strong>⚠️ Аюулгүйн анхааруулга:</strong><br>
                    Хэрэв та энэ кодыг хүсээгүй бол энэ имэйлийг үл тоомсорлоно уу.
                </p>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Хүндэтгэсэн,<br><strong>МЕА Систем</strong>
            </p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">© 2025 Мэдээллийн Аюулгүй Байдлын Аудитын Систем</p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        console.log(`✅ OTP sent to: ${user.email}, Code: ${otpCode}`);
        
        // Update last login attempt
        await db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);
        
        // Generate temporary token
        const tempToken = jwt.sign(
            { userId: user.id, email: user.email, type: 'otp_verify' },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '10m' }
        );
        
        res.json({
            success: true,
            pending_2fa: true,
            tempToken: tempToken,
            message: 'Баталгаажуулах кодыг таны имэйл хаяг руу илгээлээ.'
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
// POST: Verify OTP
// Route: /api/auth/verify-otp
// ====================================
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp_code, temp_token } = req.body;
        
        if (!email || !otp_code) {
            return res.status(400).json({
                success: false,
                message: 'Имэйл болон код оруулна уу.'
            });
        }
        
        // Verify temp token
        try {
            const decoded = jwt.verify(temp_token, process.env.JWT_SECRET || 'supersecretkey');
            if (decoded.type !== 'otp_verify' || decoded.email !== email) {
                return res.status(401).json({
                    success: false,
                    message: 'Токен хүчингүй байна.'
                });
            }
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Токен хүчингүй эсвэл хугацаа дууссан.'
            });
        }
        
        // Find user and verify OTP
        const [userRows] = await db.query(
            `SELECT id, email, full_name, role 
             FROM admins 
             WHERE email = ? 
             AND otp_code = ? 
             AND otp_expires > NOW()`,
            [email, otp_code]
        );
        
        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Код буруу эсвэл хугацаа дууссан байна.'
            });
        }
        
        const user = userRows[0];
        
        // Clear OTP
        await db.query(
            `UPDATE admins 
             SET otp_code = NULL, 
                 otp_expires = NULL 
             WHERE id = ?`,
            [user.id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '24h' }
        );
        
        console.log(`✅ User logged in: ${user.email}`);
        
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
        
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Баталгаажуулах үйл явц алдаатай.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ====================================
// POST: Resend OTP
// Route: /api/auth/resend-otp
// ====================================
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Имэйл хаяг оруулна уу.'
            });
        }
        
        // Find user
        const [userRows] = await db.query(
            'SELECT id, email, full_name FROM admins WHERE email = ?',
            [email]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Хэрэглэгч олдсонгүй.'
            });
        }
        
        const user = userRows[0];
        
        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 600000); // 10 minutes
        
        // Update OTP
        await db.query(
            `UPDATE admins 
             SET otp_code = ?, 
                 otp_expires = ? 
             WHERE id = ?`,
            [otpCode, otpExpires, user.id]
        );
        
        // Send email
        const mailOptions = {
            from: '"МЕА Систем" <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: 'Баталгаажуулах код (Дахин) - МЕА Систем',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #053B50 0%, #007BFF 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .otp-box { background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
    .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 13px; }
</style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>🔐 Шинэ Код</h1></div>
        <div class="content">
            <p>Сайн байна уу, <strong>${user.full_name}</strong>!</p>
            <p>Таны шинэ баталгаажуулах код:</p>
            <div class="otp-box"><div class="otp-code">${otpCode}</div></div>
            <p style="color: #666;">📌 10 минутын дараа хүчингүй болно.</p>
        </div>
        <div class="footer"><p>© 2025 МЕА Систем</p></div>
    </div>
</body>
</html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        console.log(`✅ OTP resent to: ${user.email}, Code: ${otpCode}`);
        
        res.json({
            success: true,
            message: 'Шинэ баталгаажуулах код илгээгдлээ.'
        });
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Код дахин илгээхэд алдаа гарлаа.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
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

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Сэргээх линк таны имэйл рүү амжилттай илгээгдлээ.' });

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
module.exports = router;