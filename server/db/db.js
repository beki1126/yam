// server/db/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308, 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '20021126Aa',
    database: process.env.DB_NAME || 'auditdb1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Холболт тестлэх
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL холболт амжилттай');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL холболт амжилтгүй:', err.message);
    });

module.exports = pool;