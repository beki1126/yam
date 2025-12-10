// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Routes import
const authRoutes = require('./routes/auth');
const orgsRoutes = require('./routes/orgs');
const auditRoutes = require('./routes/audit');
const statRoutes = require('./routes/statRoutes');
const uploadRoutes = require('./routes/upload');
const forgotpasswordRoutes = require('./routes/forgotpassword');

const app = express();

// ================================================================
// MIDDLEWARE
// ================================================================
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://192.168.10.20:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================================================
// ROUTES
// ================================================================
app.use('/api/auth', authRoutes);
app.use('/api/auth', forgotpasswordRoutes);
app.use('/api/organizations', orgsRoutes);
app.use('/api', auditRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Audit Portal Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ 
        success: true,
        message: 'Audit Portal API',
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'API endpoint олдсонгүй.',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false,
        message: 'Серверийн алдаа гарлаа.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ================================================================
// VERCEL EXPORT (Маш чухал!)
// ================================================================
module.exports = app;

// ================================================================
// LOCAL DEVELOPMENT ONLY
// ================================================================
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    
    // 🔥 ЭНД ЗАСВАР: 0.0.0.0 нэмэх
    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('='.repeat(60));
        console.log('🚀 AUDIT PORTAL BACKEND');
        console.log('='.repeat(60));
        console.log(`✅ Server running on: http://localhost:${PORT}`);
        console.log(`✅ Network access: http://192.168.10.20:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${process.env.DB_NAME || 'auditdb1'}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log(`🌐 Network URL: http://192.168.10.20:5173 ✅`);
        console.log('='.repeat(60));
        console.log('');
        console.log('📡 Available endpoints:');
        console.log('   GET  /api/health');
        console.log('   POST /api/auth/login                           ✅ 2FA');
        console.log('   POST /api/auth/verify-otp                      ✅ 2FA');
        console.log('   POST /api/auth/resend-otp                      ✅ 2FA');
        console.log('   POST /api/auth/forgot-password                 ✅ PASSWORD RESET');
        console.log('   POST /api/auth/reset-password-confirm/:token   ✅ PASSWORD RESET');
        console.log('   GET  /api/auth/me');
        console.log('   POST /api/auth/logout');
        console.log('   GET  /api/organizations');
        console.log('   POST /api/organizations');
        console.log('   GET  /api/audits');
        console.log('   POST /api/audits');
        console.log('   GET  /api/standards');
        console.log('   GET  /api/stats/dashboard');
        console.log('   POST /api/upload/file');
        console.log('   GET  /api/upload/file/:filename');
        console.log('='.repeat(60));
        console.log('');
    });
}