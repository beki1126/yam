// ============================================
// REPORTMODAL.JSX - Readable Compact Version (ТОМРУУЛСАН & Олон Файлтай, Илүү Найдвартай Задалгаа)
// ============================================

import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Grid, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import {
    Assignment, Business, Security, Description, Close, 
    Place, Email, Phone, CheckCircle, Cancel, Warning
} from "@mui/icons-material";
import moment from "moment";

// 📦 Import constants (Өөрчлөгдөөгүй)
import { LICENSE_TYPES, PRIMARY_BLUE, NAVY_COLOR } from "./constants";

// 🎨 Ultra compact colors (Өөрчлөгдөөгүй)
const COLORS = {
    primary: PRIMARY_BLUE,
    navy: NAVY_COLOR,
    success: "#10b981", 
    warning: "#f59e0b",
    danger: "#ef4444", 
    gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        900: "#111827",
    }
};

/**
 * Сертификатын мэдээллийг задална. (Өөрчлөгдөөгүй)
 */
const parseCertificates = (certificates, certDates, owners) => {
    if (!certificates) return [];
    
    const certList = typeof certificates === 'string' 
        ? certificates.split(/\||\\n|\n/).map(s => s.trim()).filter(Boolean) : [certificates];
        
    const dateList = certDates 
        ? (typeof certDates === 'string' ? certDates.split(/\||\\n|\n/).map(s => s.trim()).filter(Boolean) : [certDates]) : [];
        
    const ownerList = owners 
        ? (typeof owners === 'string' ? owners.split(/,|\||\\n|\n/).map(s => s.trim()).filter(Boolean) : [owners]) : [];
        
    const maxLength = Math.max(certList.length, dateList.length, ownerList.length);
    const result = [];
    
    for (let i = 0; i < maxLength; i++) {
        result.push({
            certificate: certList[i] || '—',
            expireDate: dateList[i] || null,
            owner: ownerList[i] || '—'
        });
    }
    return result;
};

/**
 * Сертификатын дуусах огноог үндэслэн статусыг тодорхойлно. (Өөрчлөгдөөгүй)
 */
const getCertStatus = (dateString) => {
    if (!dateString || dateString === '—') return { label: 'Тодорхойгүй', color: COLORS.gray[200] };
    
    const date = moment(dateString);
    if (!date.isValid()) return { label: 'Буруу', color: COLORS.gray[200] };
    
    const daysLeft = date.diff(moment(), 'days');
    
    if (daysLeft < 0) return { label: 'Дууссан', color: COLORS.danger };
    else if (daysLeft <= 30) return { label: 'Анхааруулга', color: COLORS.warning };
    else return { label: 'Хүчинтэй', color: COLORS.success };
};

// 🎨 InfoRow (Өөрчлөгдөөгүй)
const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.85 }}>
        {React.cloneElement(icon, { sx: { fontSize: 18, color: COLORS.gray[400], mt: 0.25 } })}
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ 
                fontWeight: 600, 
                color: COLORS.gray[600],
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                display: 'block',
                mb: 0.25,
            }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ 
                color: COLORS.navy,
                fontSize: '0.9rem',
                fontWeight: 500,
            }}>
                {value || "—"}
            </Typography>
        </Box>
    </Box>
);

// 🎨 Section Title (Өөрчлөгдөөгүй)
const SectionTitle = ({ icon, title }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.75, 
        mb: 1.5,
        mt: 2.5,
        pb: 0.5,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
    }}>
        {React.cloneElement(icon, { sx: { fontSize: 18, color: COLORS.primary } })}
        <Typography variant="subtitle2" sx={{ 
            color: COLORS.navy,
            fontWeight: 700,
            fontSize: '0.9rem',
        }}>
            {title}
        </Typography>
    </Box>
);

// ============================================
// ҮНДСЭН КОМПОНЕНТ
// ============================================

export default function ReportModal({ open, report, onClose }) {
    if (!report) return null;

    // Огноог YYYY.MM.DD форматаар хөрвүүлэх функц (Өөрчлөгдөөгүй)
    const formatDate = (dateString) => 
        dateString && moment(dateString).isValid() ? moment(dateString).format('YYYY.MM.DD') : "—";

    // Сертификатын мэдээллийг задалж бэлтгэх (Өөрчлөгдөөгүй)
    const certificates = parseCertificates(report.certificates, report.cert_expire_date, report.contact_person);

    // 💡 ШИНЭЧИЛСЭН: attachment_filename-ийг массив болгож бэлтгэх
    // Олон тусгаарлагчийг дэмжинэ: таслал, босоо зураас, шинэ мөр
    let fileList = [];
    if (Array.isArray(report.attachment_filename)) {
        fileList = report.attachment_filename.filter(Boolean);
    } else if (typeof report.attachment_filename === 'string' && report.attachment_filename.trim()) {
        // Регуляр илэрхийлэл ашиглан таслал (,), босоо зураас (|), эсвэл шинэ мөр (\n)-өөр задална
        fileList = report.attachment_filename
            .split(/[,|\n]/) 
            .map(s => s.trim())
            .filter(Boolean); // Хоосон утгуудыг хасна
    }
    
    //console.log("File List (Debug):", fileList); // Дибаг хийхэд зориулсан

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 1.5, maxHeight: '88vh' } }}
        >
            {/* Header: Үсгийн хэмжээг томруулсан */}
            <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.primary})`,
                color: 'white',
                py: 1.75,
                px: 2.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Assignment sx={{ fontSize: 22 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            {report.org_name} 
                        </Typography>
                    </Box>
                    {/* Status Chip (Header доторх) */}
                    {(() => {
                        const status = getCertStatus(report.license_expire_date);
                        return (
                            <Chip 
                                label={status.label}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    '& .MuiChip-label': { px: 1.2 }
                                }}
                            />
                        );
                    })()}
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 1.5, px: 2.5, pb: 1.5, bgcolor: 'white' }}>
                
                {/* SECTION 1: Үндсэн мэдээлэл */}
                <Box>
                    <SectionTitle title="Үндсэн мэдээлэл" icon={<Business />} />
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <InfoRow icon={<Business />} label="Байгууллага" value={report.org_name} />
                        <InfoRow icon={<Description />} label="Регистр" value={report.registration_number} />
                        <InfoRow icon={<Place />} label="Хаяг" value={report.address} />
                    </Paper>
                </Box>

                {/* SECTION 2: Зөвшөөрөл (Өөрчлөгдөөгүй) */}
                <Box>
                    <SectionTitle title="Зөвшөөрөл" icon={<Security />} />
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        
                        {/* Төрөл (Chips) */}
                        <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ 
                                fontWeight: 600, 
                                color: COLORS.gray[600],
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                display: 'block',
                                mb: 0.5,
                            }}>
                                Төрөл
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                {(() => {
                                    const keysArray = Array.isArray(report.license_type) 
                                        ? report.license_type 
                                        : report.license_type?.split(',').map(s => s.trim()).filter(Boolean) || [];
                                        
                                    if (keysArray.length === 0) {
                                        return (
                                            <Typography variant="caption" sx={{ color: COLORS.gray[400], fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                Зөвшөөрөл байхгүй
                                            </Typography>
                                        );
                                    }
                                    return keysArray.map((key) => {
                                        const license = LICENSE_TYPES.find(lt => lt.key === key);
                                        const shortLabel = license?.label.split(' ')[0] || key;
                                        return (
                                            <Chip 
                                                key={key} 
                                                label={shortLabel}
                                                size="small"
                                                sx={{ 
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    bgcolor: COLORS.primary,
                                                    color: 'white',
                                                    height: 22,
                                                    '& .MuiChip-label': { px: 0.85 }
                                                }}
                                            />
                                        );
                                    });
                                })()}
                            </Box>
                        </Box>

                        {/* Тушаал, Дуусах огноо ба Статус */}
                        <Grid container spacing={1.5}>
                            <Grid item xs={4}>
                                <InfoRow icon={<Description />} label="Тушаал №" value={report.license_numbers} />
                            </Grid>
                            <Grid item xs={4}>
                                <InfoRow icon={<Warning />} label="Дуусах огноо" value={formatDate(report.license_expire_date)} />
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ py: 0.85 }}>
                                    <Typography variant="caption" sx={{ 
                                        fontWeight: 600, 
                                        color: COLORS.gray[600],
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        mb: 0.5,
                                    }}>
                                        Статус
                                    </Typography>
                                    {(() => {
                                        const status = getCertStatus(report.license_expire_date);
                                        return (
                                            <Chip 
                                                label={status.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: status.color,
                                                    color: status.color === COLORS.gray[200] ? COLORS.gray[700] : 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    '& .MuiChip-label': { px: 0.85 }
                                                }}
                                            />
                                        );
                                    })()}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SECTION 3: Сертификат (Өөрчлөгдөөгүй) */}
                <Box>
                    <SectionTitle title="Сертификат" icon={<Security />} />
                    {certificates.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${COLORS.gray[200]}`, borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: COLORS.gray[100] }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.navy, py: 0.85, width: '5%' }}>№</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.navy, py: 0.85 }}>Сертификат</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.navy, py: 0.85, width: '20%' }}>Огноо</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.navy, py: 0.85, width: '15%' }}>Статус</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.navy, py: 0.85, width: '20%' }}>Эзэмшигч</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {certificates.map((cert, index) => {
                                        const status = getCertStatus(cert.expireDate);
                                        return (
                                            <TableRow key={index} sx={{ '&:hover': { bgcolor: COLORS.gray[50] }, '&:last-child td': { borderBottom: 0 } }}>
                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.gray[600], py: 1.2 }}>{index + 1}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.gray[900], py: 1.2 }}>{cert.certificate}</TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.gray[700], py: 1.2, fontFamily: 'monospace' }}>{formatDate(cert.expireDate)}</TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Chip 
                                                        label={status.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: status.color,
                                                            color: status.color === COLORS.gray[200] ? COLORS.gray[700] : 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': { px: 0.7 }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.gray[700], py: 1.2 }}>{cert.owner}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        // Сертификат байхгүй үед харуулах загвар
                        <Paper elevation={0} sx={{ p: 1.5, border: `1px dashed ${COLORS.gray[200]}`, borderRadius: 1, textAlign: 'center' }}>
                            <Security sx={{ fontSize: 32, color: COLORS.gray[200], mb: 0.5 }} />
                            <Typography variant="caption" sx={{ color: COLORS.gray[400], fontSize: '0.8rem' }}>
                                Сертификат байхгүй
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* SECTION 4: Холбоо барих (Өөрчлөгдөөгүй) */}
                <Box>
                    <SectionTitle title="Холбоо барих" icon={<Email />} />
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                                <InfoRow icon={<Phone />} label="Утас" value={report.contact_phone} />
                            </Grid>
                            <Grid item xs={6}>
                                <InfoRow icon={<Email />} label="И-мэйл" value={report.email} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SECTION 5: Нэмэлт (Олон файл хавсаргах боломжтой болсон) */}
                {(fileList.length > 0 || report.reporting_org) && ( 
                    <Box>
                        <SectionTitle title="Нэмэлт" icon={<Description />} />
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                            
                            {/* Олон файлыг Map хийж харуулах хэсэг */}
                            {fileList.map((fileUrl, index) => (
                                <Box 
                                    key={index} 
                                    // Сүүлийнхээс бусад файлуудад зай (margin) өгөх
                                    sx={{ mb: fileList.length > 0 && index < fileList.length - 1 ? 1 : 0.5 }} 
                                >
                                    <a 
                                        href={fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <Description sx={{ fontSize: 18, color: COLORS.primary }} />
                                        <Typography variant="body2" sx={{ 
                                            fontWeight: 500, 
                                            color: COLORS.navy, 
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all'
                                        }}>
                                            {/* URL-ийн хамгийн сүүлийн хэсгийг файлын нэр болгож харуулна */}
                                            {fileUrl.split('/').pop()}
                                        </Typography>
                                    </a>
                                </Box>
                            ))}
                            
                            {/* Тайлбар/Тэмдэглэл */}
                            {report.reporting_org && (
                                <Box sx={{ mt: fileList.length > 0 ? 1.5 : 0 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.gray[700], fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        {report.reporting_org}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            
            {/* Dialog Actions (Хөл) */}
            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${COLORS.gray[200]}`, bgcolor: 'white' }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    startIcon={<Close />}
                    sx={{ 
                        textTransform: "none",
                        borderRadius: 1,
                        px: 2.5,
                        py: 0.8,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.navy },
                    }}
                >
                    Хаах
                </Button>
            </DialogActions>
        </Dialog>
    );
}