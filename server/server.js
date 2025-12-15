const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const orgsRoutes = require('./routes/orgs');
const auditRoutes = require('./routes/audit');
const statRoutes = require('./routes/statRoutes');
const uploadRoutes = require('./routes/upload');
const forgotpasswordRoutes = require('./routes/forgotpassword');

const app = express();

// ===================== MIDDLEWARE =====================
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================== ROUTES =====================
app.use('/api/auth', authRoutes);
app.use('/api/auth', forgotpasswordRoutes);
app.use('/api/organizations', orgsRoutes);
app.use('/api', auditRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// ===================== SERVER START =====================
if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Backend running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
}

module.exports = app;

