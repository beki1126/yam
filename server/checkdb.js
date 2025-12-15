const mysql = require("mysql2/promise");

async function checkDatabase() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "20021126Aa",
        database: "auditdb1",
        port: 3308,
    });

    try {
        console.log("🔍 Таблицуудыг шалгаж байна...\n");

        const connection = await pool.getConnection();
        const [tables] = await connection.query("SHOW TABLES;");
        
        console.log("📊 ОДООГИЙН ТАБЛИЦУУД:");
        console.log("=".repeat(50));
        tables.forEach((row, i) => {
            const name = Object.values(row)[0];
            console.log(`${i + 1}. ${name}`);
        });

        console.log("\n");

        // Хүснэгт бүрийн баганууд
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await connection.query(`DESCRIBE ${tableName};`);
            
            console.log(`\n📋 ${tableName.toUpperCase()}:`);
            console.log("-".repeat(50));
            columns.forEach(col => {
                const nullable = col.Null === 'NO' ? '❌ NOT NULL' : '✓ NULL';
                const key = col.Key ? `[${col.Key}]` : '';
                console.log(`   • ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${nullable} ${key}`);
            });
        }
//checkdb
        connection.release();
        await pool.end();
        console.log("\n✅ Шалгалт дууслаа!");

    } catch (error) {
        console.error("❌ АЛДАА:", error.message);
        process.exit(1);
    }
}

checkDatabase();
