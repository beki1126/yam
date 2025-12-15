// server/db/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Холболт тестлэх (Railway friendly)
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected (Railway)');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        process.exit(1); // 🔥 чухал
    }
})();

module.exports = pool;
