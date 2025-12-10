// ============================================
// ATTACHFILEMODAL.JSX - File Upload Modal (Зөвхөн файл upload)
// ============================================

import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, TextField, InputAdornment,
    IconButton, Tooltip, Alert, CircularProgress, Fade
} from "@mui/material";
import {
    AttachFile, UploadFile, Link, Delete, Close,
    DeleteOutline, FolderOpen
} from "@mui/icons-material";
import api from "../../api";
import { showNotification } from "./utils";
import { PRIMARY_BLUE, NAVY_COLOR } from "./constants";

// Туслах функц: Pipe-ээр тусгаарлагдсан стрингээс URL-уудыг массив болгох
const parseAttachmentString = (str) => {
    if (!str) return [];
    return str.split('|').map(url => {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) return null;
        return {
            url: trimmedUrl,
            name: trimmedUrl.split('/').pop() || 'Хавсралт'
        };
    }).filter(Boolean);
};

// Туслах функц: URL-уудын массивыг Pipe-ээр тусгаарлагдсан стринг болгох
const formatAttachmentString = (attachments) => {
    return attachments.map(att => att.url).join(' | ');
};

export default function AttachFileModal({ 
    open, 
    org, 
    onClose, 
    token, 
    onUpdateOrgRow, 
    onFetchData 
}) {
    const [selectedFile, setSelectedFile] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState([]); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    // Модал нээгдэх эсвэл org өөрчлөгдөхөд хавсралтуудыг шинэчлэх
    useEffect(() => {
        if (org?.attachment_filename) {
            setAttachments(parseAttachmentString(org.attachment_filename));
        } else {
            setAttachments([]);
        }
        setSelectedFile(null);
        setFileToDelete(null);
    }, [org, open]);

    // 1. Файл сонгох
    const handleFileChange = (e) => { 
        const file = e.target.files[0];
        if (!file) return;
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showNotification('error', 'Файл хэт том байна', 'Файлын хэмжээ 10MB-аас их байж болохгүй.');
            e.target.value = '';
            return;
        }
        
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!allowedTypes.includes(file.type)) {
            showNotification('error', 'Файлын төрөл буруу', 'Зөвхөн JPG, PNG, PDF, DOCX, XLSX файл оруулна уу.');
            e.target.value = '';
            return;
        }
        
        setSelectedFile(file);
        showNotification('info', 'Файл сонгогдлоо', `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    };
    
    // 2. Файлыг сервер рүү илгээх
    const handleFileUpload = async () => {
        if (!selectedFile || !token) {
            showNotification('warning', 'Анхааруулга', 'Файл болон нэвтрэх эрх шаардлагатай.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const r = await api.post("/upload/file", formData, { 
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "multipart/form-data" 
                } 
            });
            const fileUrl = r.data.file_url; 
            
            const newAttachments = [...attachments, { url: fileUrl, name: selectedFile.name }];
            await updateOrgAttachment(newAttachments);
            
            setSelectedFile(null);
            showNotification('success', 'Амжилттай!', 'Файл амжилттай хавсаргагдлаа.');

        } catch (err) { 
            console.error("Файл илгээхэд алдаа гарлаа:", err); 
            const errorMessage = err.response?.data?.message || err.message || "Файл илгээхэд тодорхойгүй алдаа гарлаа.";
            showNotification('error', 'Алдаа гарлаа', errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    // 3. Байгууллагын мэдээлэл дээрх хавсралтуудыг шинэчлэх
    const updateOrgAttachment = async (newAttachments) => {
        if (!org?.id || !token) {
            showNotification('error', 'Алдаа', 'Байгууллагын ID эсвэл нэвтрэх эрх олдсонгүй.');
            return;
        }

        const attachmentString = formatAttachmentString(newAttachments);
        
        try {
            const r = await api.put(`/organizations/${org.id}`, 
                { attachment_filename: attachmentString }, 
                { 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );
            
            setAttachments(newAttachments);
            onUpdateOrgRow(r.data); 
            if (onFetchData) {
                onFetchData();
            }
            
        } catch (err) {
            console.error("❌ URL шинэчлэхэд алдаа гарлаа:", err);
            const errorMessage = err.response?.data?.message || err.message || "Хавсралтыг хадгалахад тодорхойгүй алдаа гарлаа.";
            showNotification('error', 'Алдаа гарлаа', errorMessage);
            throw err;
        }
    };

    // 4. Хавсралт устгахыг баталгаажуулах модалыг нээх
    const handleDeleteClick = (attachment) => {
        setFileToDelete(attachment);
        setShowDeleteConfirm(true);
    };

    // 5. Устгахыг баталгаажуулах
    const handleDeleteConfirm = async () => {
        if (!fileToDelete) return;
        
        try {
            // 1️⃣ Энэ нь серверт upload хийсэн файл эсэхийг шалгах
            const isUploadedFile = fileToDelete.url.includes('/uploads/attachments/');
            
            if (isUploadedFile) {
                // Серверийн файлыг устгах
                const filename = fileToDelete.url.split('/').pop();
                
                try {
                    await api.delete(`/upload/file/${filename}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`✅ Серверийн файл устгагдлаа: ${filename}`);
                } catch (deleteErr) {
                    console.warn('⚠️ Серверийн файл устгахад алдаа:', deleteErr);
                }
            }
            
            // 2️⃣ Database-аас холбоосыг устгах
            const updatedAttachments = attachments.filter(
                att => att.url !== fileToDelete.url
            );
            
            await updateOrgAttachment(updatedAttachments);
            
            // Мэдэгдэл харуулах
            showNotification(
                'success', 
                'Амжилттай!', 
                isUploadedFile 
                    ? `"${fileToDelete.name}" файл болон холбоос амжилттай устгагдлаа.`
                    : `"${fileToDelete.name}" холбоос амжилттай устгагдлаа.`
            );

        } catch (e) {
            console.error("❌ Файл устгахад алдаа:", e);
            showNotification('error', 'Алдаа гарлаа', 'Файл устгахад алдаа гарлаа.');
        } finally {
            setShowDeleteConfirm(false);
            setFileToDelete(null);
        }
    };


    return (
        <>
            {/* MAIN ATTACH FILE MODAL */}
            <Dialog 
                open={open} 
                onClose={onClose} 
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ 
                    background: NAVY_COLOR, 
                    color: "white",
                    fontWeight: 700,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <AttachFile sx={{ mr: 1, verticalAlign: 'middle' }} /> 
                    {org?.org_name} - Файл Хавсаргах
                </DialogTitle>
                
                <DialogContent sx={{ mt: 3, px: 3 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Та тухайн байгууллагад хамаарах аудитын тайлан, гэрчилгээний хуулбар зэрэг хэд хэдэн материалыг **PDF, JPG, DOCX, XLSX** форматаар хавсаргах боломжтой.
                    </Alert>

                    {/* Одоогийн Хавсралтууд */}
                    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                        <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5, 
                            color: PRIMARY_BLUE, 
                            display: 'flex', 
                            alignItems: 'center' 
                        }}>
                            <FolderOpen sx={{ mr: 1, fontSize: 20 }} /> Одоогийн Хавсралтууд ({attachments.length}):
                        </Typography>
                        
                        {attachments.length > 0 ? (
                            <Box>
                                {attachments.map((att, index) => (
                                    <Box key={att.url} sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        py: 0.5,
                                        borderBottom: index < attachments.length - 1 ? '1px dotted #eee' : 'none'
                                    }}>
                                        <a 
                                            href={att.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ 
                                                color: NAVY_COLOR, 
                                                fontWeight: 500, 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis', 
                                                whiteSpace: 'nowrap',
                                                flex: 1,
                                                marginRight: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            📎 {att.name}
                                        </a>
                                        <Tooltip title="Хавсралтыг устгах">
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleDeleteClick(att)}
                                                sx={{
                                                    '&:hover': { bgcolor: '#ffebee' }
                                                }}
                                            >
                                                <Delete fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', pl: 1 }}>
                                Одоогоор файл хавсаргаагүй байна.
                            </Typography>
                        )}
                    </Box>

                    {/* SECTION: Файлыг шууд илгээх */}
                    <Typography variant="h6" sx={{ 
                        color: NAVY_COLOR, 
                        mb: 1.5, 
                        borderBottom: '1px solid #eee', 
                        pb: 0.5,
                        fontWeight: 600
                    }}>
                        Файлыг шууд илгээх
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        mb: 2, 
                        p: 2.5, 
                        bgcolor: '#eef2ff', 
                        borderRadius: 2 
                    }}>
                        <input
                            accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
                            style={{ display: 'none' }}
                            id="upload-file-button"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="upload-file-button" style={{ flex: 1 }}>
                            <Button 
                                variant="outlined" 
                                component="span" 
                                size="medium"
                                fullWidth
                                startIcon={<AttachFile />}
                                sx={{ 
                                    textTransform: 'none', 
                                    borderRadius: 1, 
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                                disabled={isUploading}
                            >
                                {selectedFile ? selectedFile.name : 'Файл Сонгох (PDF, Docx, JPG...)'}
                            </Button>
                        </label>
                        <Button
                            variant="contained"
                            size="medium"
                            color="success"
                            disabled={!selectedFile || isUploading}
                            onClick={handleFileUpload}
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                            sx={{ 
                                textTransform: 'none', 
                                borderRadius: 1, 
                                color: 'white',
                                fontWeight: 600,
                                flexShrink: 0
                            }}
                        >
                            {isUploading ? "Илгээж байна..." : "Сервер рүү Илгээх"}
                        </Button>
                    </Box>
                </DialogContent>
                
                {/* FOOTER */}
                <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button 
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            color: NAVY_COLOR,
                            borderColor: NAVY_COLOR,
                            fontWeight: 600
                        }}
                    >
                        Хаах
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG - DeleteModal загвартай адилхан */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                maxWidth="xs"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: "#ffffff",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        overflow: "hidden"
                    }
                }}
            >
                {/* HEADER */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                        py: 2.5,
                        borderBottom: "1px solid #f0f0f0"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <DeleteOutline sx={{ fontSize: 22, color: "#666" }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                            Хавсралт устгах
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setShowDeleteConfirm(false)}
                        size="small"
                        sx={{
                            color: "#999",
                            "&:hover": { bgcolor: "#f5f5f5", color: "#666" }
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>

                {/* BODY */}
                <DialogContent sx={{ px: 3, py: 3 }}>
                    <Box>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#1a1a1a",
                                mb: 2,
                                fontSize: "0.95rem",
                                lineHeight: 1.6
                            }}
                        >
                            <strong style={{ fontWeight: 600 }}>"{fileToDelete?.name}"</strong> файлыг байгууллагын бүртгэлээс устгах гэж байна.
                        </Typography>

                        <Box
                            sx={{
                                bgcolor: "#fafafa",
                                border: "1px solid #e8e8e8",
                                borderRadius: 2,
                                p: 2,
                                mb: 2
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#666",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.7,
                                    mb: 1
                                }}
                            >
                                {fileToDelete?.url.includes('/uploads/attachments/')
                                    ? "Дараах зүйлс устах болно:"
                                    : "Устах зүйлс:"
                                }
                            </Typography>
                            <Box
                                component="ul"
                                sx={{
                                    m: 0,
                                    pl: 2.5,
                                    "& li": {
                                        color: "#666",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.8,
                                        mb: 0.5
                                    }
                                }}
                            >
                                {fileToDelete?.url.includes('/uploads/attachments/') ? (
                                    <>
                                        <li>Холбоос database-аас хасагдана</li>
                                        <li>Файл серверээс бүрмөсөн устана</li>
                                    </>
                                ) : (
                                    <li>Холбоос database-аас хасагдана</li>
                                )}
                            </Box>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "#999",
                                fontSize: "0.8rem",
                                fontStyle: "italic"
                            }}
                        >
                            Энэ үйлдлийг буцаах боломжгүй.
                        </Typography>
                    </Box>
                </DialogContent>

                {/* ACTIONS */}
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 0,
                        gap: 1.5
                    }}
                >
                    <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        fullWidth
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            py: 1.1,
                            color: "#666",
                            bgcolor: "#f5f5f5",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            "&:hover": {
                                bgcolor: "#ebebeb"
                            }
                        }}
                    >
                        Цуцлах
                    </Button>

                    <Button
                        onClick={handleDeleteConfirm}
                        fullWidth
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            py: 1.1,
                            bgcolor: "#1a1a1a",
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            "&:hover": {
                                bgcolor: "#333"
                            }
                        }}
                    >
                        Устгах
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}