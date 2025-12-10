// ====================================
// TEST EMAIL CONFIGURATION
// File: test-email.js
// ====================================

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n');
console.log('='.repeat(60));
console.log('📧 EMAIL CONFIGURATION TEST');
console.log('='.repeat(60));
console.log('\n');

// Display configuration
console.log('📋 Configuration:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set (' + process.env.EMAIL_PASS.length + ' characters)' : '❌ Not set');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set');
console.log('\n');

// Check if credentials are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ ERROR: Email credentials not configured!');
    console.log('\n');
    console.log('🔧 Fix:');
    console.log('  1. Create .env file in server directory');
    console.log('  2. Add: EMAIL_USER=your-email@gmail.com');
    console.log('  3. Add: EMAIL_PASS=your-16-char-app-password');
    console.log('\n');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    try {
        // Step 1: Verify connection
        console.log('🔍 Step 1: Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');
        
        // Step 2: Send test email
        console.log('📤 Step 2: Sending test email...');
        const info = await transporter.sendMail({
            from: `"МЕА Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: '✅ Test Email - МЕА Систем',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
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
                        }
                        .content {
                            padding: 40px 30px;
                            background: #f9f9f9;
                        }
                        .success-box {
                            background: #e8f5e9;
                            border-left: 4px solid #4caf50;
                            padding: 20px;
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
                            padding: 30px;
                            background: #f5f5f5;
                            color: #666;
                            font-size: 13px;
                        }
                        .checkmark {
                            font-size: 48px;
                            color: #4caf50;
                            text-align: center;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Email Тохиргоо Амжилттай!</h1>
                        </div>
                        
                        <div class="content">
                            <div class="checkmark">✓</div>
                            
                            <div class="success-box">
                                <h2 style="margin-top: 0; color: #2e7d32;">
                                    🎉 Баяр хүргэе!
                                </h2>
                                <p style="margin: 0;">
                                    Таны nodemailer тохиргоо <strong>зөв ажиллаж байна</strong>!
                                </p>
                            </div>
                            
                            <p>
                                Энэ нь test email юм. Хэрэв та энэ имэйлийг хүлээн авч байгаа бол:
                            </p>
                            
                            <ul>
                                <li>✅ Gmail App Password зөв тохируулагдсан</li>
                                <li>✅ SMTP холболт ажиллаж байна</li>
                                <li>✅ Email илгээх систем бэлэн байна</li>
                            </ul>
                            
                            <div class="info-box">
                                <p style="margin: 0;">
                                    <strong>📌 Дараагийн алхам:</strong><br>
                                    Forgot password системийг туршиж үзээрэй!
                                </p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            
                            <p style="font-size: 14px; color: #666;">
                                <strong>Техникийн мэдээлэл:</strong><br>
                                Огноо: ${new Date().toLocaleString('mn-MN')}<br>
                                От: ${process.env.EMAIL_USER}<br>
                                Систем: МЕА Audit Portal
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p style="margin: 5px 0;">
                                © 2024 Мэдээллийн Аюулгүй Байдлын Аудитын Систем
                            </p>
                            <p style="margin: 5px 0; color: #999;">
                                Энэ имэйл автоматаар илгээгдсэн. Хариу бичих шаардлагагүй.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        
        console.log('✅ Test email sent successfully!\n');
        console.log('📬 Message details:');
        console.log('  Message ID:', info.messageId);
        console.log('  From:', process.env.EMAIL_USER);
        console.log('  To:', process.env.EMAIL_USER);
        console.log('\n');
        
        console.log('='.repeat(60));
        console.log('✨ EMAIL ИЛГЭЭХ СИСТЕМ БЭЛЭН!');
        console.log('='.repeat(60));
        console.log('\n');
        console.log('📧 Gmail inbox-оо шалгаарай:');
        console.log('   https://mail.google.com');
        console.log('\n');
        console.log('🔍 Хайх:');
        console.log('   Subject: "✅ Test Email - МЕА Систем"');
        console.log('   From: "МЕА Test"');
        console.log('\n');
        
    } catch (error) {
        console.log('❌ EMAIL TEST FAILED!\n');
        console.error('Error:', error.message);
        console.log('\n');
        
        // Specific error handling
        if (error.code === 'EAUTH') {
            console.log('🔧 Authentication Error - Засах:');
            console.log('  1. Gmail App Password зөв эсэхийг шалгах');
            console.log('  2. .env файл дахь EMAIL_PASS зөв эсэхийг шалгах');
            console.log('  3. Зай байхгүй эсэхийг баталгаажуулах (16 тэмдэгт)');
            console.log('  4. Шинэ App Password үүсгэх');
            console.log('\n');
            console.log('📝 Current EMAIL_PASS length:', process.env.EMAIL_PASS.length);
            console.log('   Expected: 16 characters');
            console.log('   Has spaces:', /\s/.test(process.env.EMAIL_PASS) ? 'YES ❌' : 'NO ✅');
            console.log('\n');
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            console.log('🔧 Connection Error - Засах:');
            console.log('  1. Интернэт холболт шалгах');
            console.log('  2. Firewall тохиргоо шалгах');
            console.log('  3. VPN унтраах (хэрэв байвал)');
            console.log('\n');
        } else {
            console.log('🔧 Шалгах зүйлс:');
            console.log('  1. .env файл байгаа эсэх');
            console.log('  2. EMAIL_USER болон EMAIL_PASS зөв эсэх');
            console.log('  3. nodemailer суусан эсэх: npm install nodemailer');
            console.log('  4. dotenv суусан эсэх: npm install dotenv');
            console.log('\n');
        }
        
        console.log('='.repeat(60));
        console.log('\n');
        process.exit(1);
    }
}

// Run test
testEmail();