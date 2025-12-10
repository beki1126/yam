// server/db/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway-compatible MySQL configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '20021126Aa',
    database: process.env.DB_NAME || 'auditdb1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

// Production тохиргоо (Railway)
if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
    // IPv6 дэмжих
    dbConfig.insecureAuth = true;
}

// Connection pool үүсгэх
const pool = mysql.createPool(dbConfig);

// Холболт тестлэх
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL холболт амжилттай');
        console.log(`   📊 Database: ${process.env.DB_NAME || 'auditdb1'}`);
        console.log(`   🌐 Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   👤 User: ${process.env.DB_USER || 'root'}`);
        connection.release();
    } catch (err) {
        console.error('❌ MySQL холболт амжилтгүй:', err.message);
        // Production дээр app-ийг зогсоохгүй, дараа дахин оролдох
        if (process.env.NODE_ENV !== 'production') {
            console.error('💡 Шалгах зүйлс:');
            console.error('   1. MySQL server ажиллаж байгаа эсэх');
            console.error('   2. DB_HOST, DB_USER, DB_PASSWORD зөв эсэх');
            console.error('   3. Database үүссэн эсэх');
        }
    }
};

// Connection test ажиллуулах
testConnection();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Closing MySQL connection pool...');
    await pool.end();
    console.log('✅ MySQL pool closed');
    process.exit(0);
});

module.exports = pool;