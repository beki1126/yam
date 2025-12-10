// delete-admin.js
// Delete admin by email
const mysql = require('mysql2/promise');
require('dotenv').config();

async function deleteAdmin() {
    console.log('='.repeat(60));
    console.log('🗑️  АДМИН УСТГАХ SCRIPT');
    console.log('='.repeat(60));
    
    try {
        // Database connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3308,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '20021126Aa',
            database: process.env.DB_NAME || 'auditdb1'
        });
        
        console.log('\n✅ Database холбогдлоо');
        
        // ============================================
        // ЭНЭ ХЭСГИЙГ ЗАСНА УУ
        // ============================================
        const emailToDelete = 'erdenesuvd.b@pubcert.mn';  // ← Устгах админ имэйл
        // ============================================
        
        console.log('\n📝 Устгах админ имэйл:', emailToDelete);
        
        // Check if admin exists
        const [admins] = await connection.query(
            'SELECT id, email, full_name, role, created_at FROM admins WHERE email = ?',
            [emailToDelete]
        );
        
        if (admins.length === 0) {
            console.log('\n❌ Энэ имэйлтэй админ олдсонгүй!');
            console.log('\n💡 Бүх админуудыг харах:');
            console.log('   node list-admins.js');
            await connection.end();
            return;
        }
        
        const admin = admins[0];
        
        console.log('\n✅ Админ олдлоо:');
        console.log('   ID:', admin.id);
        console.log('   Email:', admin.email);
        console.log('   Full Name:', admin.full_name);
        console.log('   Role:', admin.role);
        console.log('   Created:', admin.created_at);
        
        // Count total admins
        const [countResult] = await connection.query(
            'SELECT COUNT(*) as total FROM admins WHERE is_active = 1'
        );
        
        const totalAdmins = countResult[0].total;
        
        console.log('\n📊 Систем дэх нийт админ:', totalAdmins);
        
        // Safety check - don't delete last admin
        if (totalAdmins <= 1) {
            console.log('\n⚠️  АНХААРУУЛГА: Энэ бол сүүлчийн админ!');
            console.log('⚠️  Устгах боломжгүй - системд дор хаяж 1 админ байх ёстой!');
            await connection.end();
            return;
        }
        
        console.log('\n⚠️  АНХААРУУЛГА: Устгахдаа итгэлтэй байна уу?');
        console.log('   Админ:', admin.email);
        console.log('   Нэр:', admin.full_name);
        
        // Confirmation prompt (5 seconds)
        console.log('\n⏳ 5 секундын дараа устгана...');
        console.log('💡 Зогсоох бол: Ctrl+C дарна уу!');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n🗑️  Устгаж байна...');
        
        // Delete admin
        await connection.query(
            'DELETE FROM admins WHERE id = ?',
            [admin.id]
        );
        
        console.log('\n✅ Админ амжилттай устгагдлаа!');
        
        // Verify deletion
        const [verifyResult] = await connection.query(
            'SELECT COUNT(*) as count FROM admins WHERE email = ?',
            [emailToDelete]
        );
        
        if (verifyResult[0].count === 0) {
            console.log('✅ Database-аас баталгаажлаа: Админ устсан');
        }
        
        // Show remaining admins
        const [remaining] = await connection.query(
            'SELECT id, email, full_name, role FROM admins ORDER BY id'
        );
        
        console.log('\n📊 Үлдсэн админууд (' + remaining.length + '):');
        remaining.forEach((admin, index) => {
            console.log(`   ${index + 1}. ID: ${admin.id} | ${admin.email} | ${admin.full_name} | ${admin.role}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('✨ АМЖИЛТТАЙ УСТГАГДЛАА!');
        console.log('='.repeat(60));
        
        await connection.end();
        
    } catch (error) {
        console.error('\n❌ АЛДАА ГАРЛАА:');
        console.error(error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Database холбогдохгүй байна. MySQL асаалттай эсэхийг шалгана уу.');
        }
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            console.log('\n💡 Энэ админтай холбоотой өгөгдөл байна.');
            console.log('💡 Эхлээд холбоотой өгөгдлийг устгах эсвэл is_active = 0 болгоно уу.');
        }
    }
}

// Run
deleteAdmin();