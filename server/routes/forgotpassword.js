// ====================================
// FORGOT PASSWORD ROUTES
// File: server/routes/forgot-password.js
// ====================================

const express = require('express');
const router = express.Router();
const db = require('../db/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ====================================
// EMAIL CONFIGURATION
// ====================================

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'eerdka32@gmail.com',  // ⚠️ Өөрийн email
        pass: process.env.EMAIL_PASS || 'kdbftfmnljgibkrz'     // ⚠️ App password хэрэгтэй
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server ready');
    }
});

// ====================================
// POST: Request Password Reset
// Route: /api/auth/forgot-password
// ====================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Имэйл хаяг оруулна уу.'
            });
        }
        
        // Find user by email
        const [users] = await db.query(
            'SELECT id, email, username FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            // Security: Don't reveal if email exists
            return res.json({
                success: true,
                message: 'Хэрэв таны имэйл бүртгэлтэй бол нууц үг сэргээх холбоос илгээлээ.'
            });
        }
        
        const user = users[0];
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        
        // Save to database
        await db.query(
            `UPDATE users 
             SET reset_token = ?, 
                 reset_token_expires = ? 
             WHERE id = ?`,
            [resetTokenHash, resetTokenExpires, user.id]
        );
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password-confirm/${resetToken}`;
        
        // Email HTML template
        const mailOptions = {
            from: '"МЕА Систем" <eerdka32@gmail.com>',
            to: user.email,
            subject: 'Нууц үг сэргээх - МЕА Систем',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header { 
            background: linear-gradient(135deg, #053B50 0%, #007BFF 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content { 
            padding: 40px 30px;
            background: #f9f9f9;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button { 
            display: inline-block;
            padding: 15px 40px;
            background: #007BFF;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            transition: all 0.3s;
        }
        .button:hover { 
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }
        .warning { 
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer { 
            text-align: center;
            color: #666;
            font-size: 13px;
            padding: 30px;
            border-top: 1px solid #ddd;
            background: #f5f5f5;
        }
        .token-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 20px 0;
            border: 1px dashed #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Нууц үг сэргээх</h1>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 10px;">
                Сайн байна уу, <strong>${user.username || 'Хэрэглэгч'}</strong>!
            </p>
            
            <p>Та нууц үг сэргээх хүсэлт илгээсэн байна. Доорх товчийг дарж шинэ нууц үг үүсгэнэ үү:</p>
            
            <div class="button-container">
                <a href="${resetUrl}" class="button">
                    🔓 Нууц үг сэргээх
                </a>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; font-size: 14px;">
                    <strong>📌 Анхаар:</strong> Энэ холбоос <strong>1 цагийн</strong> дараа хүчингүй болно.
                </p>
            </div>
            
            <p style="font-size: 14px;">Эсвэл доорх холбоосыг хуулаад browser дээр нээнэ үү:</p>
            <div class="token-box">
                ${resetUrl}
            </div>
            
            <div class="warning">
                <p style="margin: 0; font-size: 14px;">
                    <strong>⚠️ Аюулгүйн анхааруулга:</strong><br>
                    Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлож, бусдад дамжуулахгүй байна уу.
                </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Хүндэтгэсэн,<br>
                <strong>МЕА Систем</strong>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 5px 0;">© 2025 Мэдээллийн Аюулгүй Байдлын Аудитын Систем</p>
            <p style="margin: 5px 0; color: #999;">
                Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
            </p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        console.log(`✅ Reset email sent to: ${user.email}`);
        
        res.json({
            success: true,
            message: 'Хэрэв таны имэйл бүртгэлтэй бол нууц үг сэргээх холбоос илгээлээ.'
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу.'
        });
    }
});

// ====================================
// POST: Reset Password with Token
// Route: /api/auth/reset-password-confirm/:token
// ====================================
router.post('/reset-password-confirm/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.'
            });
        }
        
        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with valid token
        const [users] = await db.query(
            `SELECT id, email, username 
             FROM users 
             WHERE reset_token = ? 
             AND reset_token_expires > NOW()`,
            [hashedToken]
        );
        
        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Токен хүчингүй эсвэл хугацаа дууссан байна.'
            });
        }
        
        const user = users[0];
        
        // Hash new password (use bcrypt in production!)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password and clear reset token
        await db.query(
            `UPDATE users 
             SET password = ?,
                 reset_token = NULL,
                 reset_token_expires = NULL
             WHERE id = ?`,
            [hashedPassword, user.id]
        );
        
        console.log(`✅ Password reset successful for: ${user.email}`);
        
        res.json({
            success: true,
            message: 'Нууц үг амжилттай шинэчлэгдлээ.'
        });
        
    } catch (error) {
        console.error('Reset password confirm error:', error);
        res.status(500).json({
            success: false,
            message: 'Нууц үг солиход алдаа гарлаа.'
        });
    }
});

module.exports = router;