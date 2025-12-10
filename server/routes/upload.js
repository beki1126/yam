const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Зөв path - server/uploads/attachments
const uploadsDir = path.join(__dirname, '../uploads/attachments');

if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('📁 Uploads directory:', uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Зөвхөн JPG, PNG, PDF, DOCX, XLSX файл оруулна уу!'));
};

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: fileFilter
});

// ====================================
// POST: Upload
// ====================================
router.post('/file', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Файл илгээгдээгүй байна.' 
            });
        }

        const fileUrl = `/uploads/attachments/${req.file.filename}`;
        
        console.log('✅ Файл хуулагдлаа:', req.file.filename);
        
        res.json({ 
            success: true,
            message: 'Файл амжилттай хуулагдлаа.',
            file_url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
        
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Файл хуулахад алдаа гарлаа.',
            error: error.message 
        });
    }
});

// ====================================
// GET: Download
// ====================================
router.get('/file/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        
        console.log('📥 Файл татах:', filePath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Файл олдсонгүй.' 
            });
        }
        
        res.sendFile(filePath);
        
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Файл татахад алдаа гарлаа.' 
        });
    }
});

// ====================================
// DELETE: Файл устгах
// ====================================
router.delete('/file/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        
        if (!filename) {
            return res.status(400).json({ 
                success: false, 
                message: 'Файлын нэр шаардлагатай.' 
            });
        }
        
        const safeName = path.basename(filename);
        const filePath = path.join(uploadsDir, safeName);
        
        console.log('🔍 Файл устгах гэж байна:', filePath);
        console.log('📂 Файл байгаа эсэх:', fs.existsSync(filePath));
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ Файл олдсонгүй:', filePath);
            
            // Folder дотор байгаа файлуудыг харуулах
            try {
                const allFiles = fs.readdirSync(uploadsDir);
                console.log('📋 Folder дотор байгаа файлууд:', allFiles);
            } catch (err) {
                console.log('⚠️ Folder уншихад алдаа:', err.message);
            }
            
            return res.status(404).json({ 
                success: false, 
                message: 'Файл олдсонгүй.',
                attempted_path: filePath
            });
        }
        
        fs.unlinkSync(filePath);
        console.log('✅ Файл амжилттай устгагдлаа:', safeName);
        
        res.json({ 
            success: true,
            message: 'Файл амжилттай устгагдлаа.',
            deleted_file: safeName
        });
        
    } catch (error) {
        console.error('❌ File delete error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Файл устгахад алдаа гарлаа.',
            error: error.message 
        });
    }
});

module.exports = router;