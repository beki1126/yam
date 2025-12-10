// ============================================
// ADDEDITMODAL.JSX - Compact Design matching ReportModal
// ============================================

import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Grid, TextField, FormControl,
    InputLabel, Select, MenuItem, OutlinedInput, Chip,
    ListItemIcon, ListItemText, Divider, IconButton, Paper,
    Alert
} from "@mui/material";
import {
    Edit, Business, Policy, VerifiedUser, AccountCircle,
    Description, CheckCircle, Close, Add, Delete, 
    Warning, SaveAlt
} from "@mui/icons-material";
import moment from "moment";
import { 
    PRIMARY_BLUE, 
    NAVY_COLOR, 
    LICENSE_TYPES, 
    MenuProps 
} from "./constants";

// 🎨 Colors matching ReportModal
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
        700: "#2d3748",
        900: "#111827",
    }
};

// 🎨 Section Title - matching ReportModal style
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

// Common TextField style
const textFieldStyle = { 
    "& .MuiOutlinedInput-root": { 
        fontSize: '0.9rem',
        bgcolor: "white",
        '& fieldset': {
            borderColor: COLORS.gray[200],
        },
        '&:hover fieldset': {
            borderColor: COLORS.primary,
        },
        '&.Mui-focused fieldset': {
            borderColor: COLORS.primary,
        },
    },
    "& .MuiInputLabel-root": {
        fontSize: '0.85rem',
        fontWeight: 500,
    }
};

export default function AddEditModal({ 
    open, 
    isEdit,
    form,
    onClose, 
    onChange,
    onSave 
}) {
    const [certificates, setCertificates] = useState([
        { certificate: '', expireDate: '', owner: '' }
    ]);

    // Parse certificates from form
    useEffect(() => {
        if (!open) return;
        
        const hasCertData = form.certificates || form.cert_expire_date || form.contact_person;
        
        if (hasCertData) {
            const certList = (form.certificates || '').split('|').map(s => s.trim()).filter(Boolean);
            const dateList = (form.cert_expire_date || '').split('|').map(s => s.trim()).filter(Boolean);
            const ownerList = (form.contact_person || '').split('|').map(s => s.trim()).filter(Boolean);

            const maxLength = Math.max(certList.length, dateList.length, ownerList.length, 1);
            
            const parsedCerts = [];
            for (let i = 0; i < maxLength; i++) {
                parsedCerts.push({
                    certificate: certList[i] || '',
                    expireDate: dateList[i] || '',
                    owner: ownerList[i] || ''
                });
            }
            
            setCertificates(parsedCerts.length > 0 ? parsedCerts : [{ certificate: '', expireDate: '', owner: '' }]);
        } else {
            setCertificates([{ certificate: '', expireDate: '', owner: '' }]);
        }
    }, [open, form.certificates, form.cert_expire_date, form.contact_person]);

    const handleAddCertificate = () => {
        setCertificates([...certificates, { certificate: '', expireDate: '', owner: '' }]);
    };

    const handleRemoveCertificate = (index) => {
        if (certificates.length > 1) {
            const newCerts = certificates.filter((_, i) => i !== index);
            setCertificates(newCerts);
        }
    };

    const handleCertificateChange = (index, field, value) => {
        const newCerts = [...certificates];
        newCerts[index][field] = value;
        setCertificates(newCerts);
    };

    const handleSaveWithCertificates = () => {
        const validCertificates = certificates.filter(c => c.certificate || c.expireDate || c.owner);
        
        const certNames = validCertificates.map(c => c.certificate).join(' | ');
        const certDates = validCertificates.map(c => c.expireDate).join(' | ');
        const certOwners = validCertificates.map(c => c.owner).join(' | ');

        const updatedForm = {
            ...form,
            certificates: certNames,
            cert_expire_date: certDates,
            contact_person: certOwners,
        };

        onSave(updatedForm);
    };

    const getLicenseStatus = (date) => {
        if (!date || !moment(date).isValid()) return { text: "—", bg: COLORS.gray[100], color: COLORS.gray[600] };
        const exp = Math.ceil(moment(date).diff(moment(), "hours") / 24);
        if (exp < 0) return { text: `🔴 Дууссан (${Math.abs(exp)} хоног өнгөрсөн)`, bg: "#ffdddd", color: COLORS.danger };
        if (exp < 30) return { text: `🟡 Анхааруулга (${exp} хоног үлдсэн)`, bg: "#fffbe6", color: COLORS.warning };
        return { text: `🟢 Хүчинтэй (${exp} хоног үлдсэн)`, bg: "#e6ffed", color: COLORS.success };
    };

    const licenseStatus = getLicenseStatus(form.license_expire_date);

    if (!open) return null;

    return (
        <Dialog 
            open={open} 
            fullWidth 
            maxWidth="md" 
            onClose={onClose}
            PaperProps={{ 
                sx: { 
                    borderRadius: 1.5, 
                    maxHeight: '92vh', 
                    m: 2,
                } 
            }}
        >
            {/* HEADER - matching ReportModal */}
            <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.primary})`,
                color: "white",
                py: 1.75,
                px: 2.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {isEdit ? <Edit sx={{ fontSize: 22 }} /> : <Business sx={{ fontSize: 22 }} />}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            {isEdit ? 'Байгууллагын мэдээлэл засах' : 'Шинэ байгууллага нэмэх'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            {/* CONTENT */}
            <DialogContent sx={{ 
                pt: 1.5, 
                px: 2.5, 
                pb: 1.5,
                bgcolor: 'white', 
                overflowY: 'auto'
            }}>
                
                {/* SECTION 1: Үндсэн мэдээлэл */}
                <Box>
                    <SectionTitle icon={<Business />} title="Үндсэн мэдээлэл" />
                    
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Байгууллагын нэр"
                                    name="org_name"
                                    value={form.org_name || ""}
                                    onChange={onChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Хуулийн этгээдийн регистр"
                                    name="registration_number"
                                    value={form.registration_number || ""}
                                    onChange={onChange}
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Хаяг/Байршил"
                                    name="address"
                                    value={form.address || ""}
                                    onChange={onChange}
                                    multiline
                                    rows={2}
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SECTION 2: Зөвшөөрлийн мэдээлэл */}
                <Box>
                    <SectionTitle icon={<Policy />} title="Зөвшөөрлийн мэдээлэл" />
                    
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                        Зөвшөөрлийн төрөл
                                    </InputLabel>
                                    <Select
                                        multiple 
                                        name="license_type"
                                        value={form.license_type || []} 
                                        onChange={onChange}
                                        input={<OutlinedInput label="Зөвшөөрлийн төрөл" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const license = LICENSE_TYPES.find(lt => lt.key === value);
                                                    return (
                                                        <Chip 
                                                            key={value} 
                                                            label={license?.label.split(' ')[0] || value} 
                                                            size="small"
                                                            sx={{ 
                                                                fontWeight: 600, 
                                                                fontSize: '0.7rem',
                                                                height: 22,
                                                                bgcolor: COLORS.primary,
                                                                color: 'white',
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </Box>
                                        )}
                                        MenuProps={MenuProps}
                                        sx={{
                                            fontSize: '0.9rem',
                                            bgcolor: 'white',
                                            '& fieldset': { borderColor: COLORS.gray[200] },
                                            '&:hover fieldset': { borderColor: COLORS.primary },
                                        }}
                                    >
                                        {LICENSE_TYPES.filter(lt => lt.key !== 'All').map(license => (
                                            <MenuItem key={license.key} value={license.key} sx={{ fontSize: '0.85rem' }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>{license.icon}</ListItemIcon>
                                                <ListItemText primary={license.label} primaryTypographyProps={{ fontSize: '0.85rem' }}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Тушаалын огноо, дугаар"
                                    name="license_numbers"
                                    value={form.license_numbers || ""}
                                    onChange={onChange}
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Зөвшөөрөл дуусах хугацаа"
                                    name="license_expire_date"
                                    value={form.license_expire_date && moment(form.license_expire_date).isValid() ? moment(form.license_expire_date).format('YYYY-MM-DD') : ''}
                                    onChange={onChange}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={8}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Статус"
                                    value={licenseStatus.text}
                                    InputProps={{ readOnly: true }}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ 
                                        "& .MuiOutlinedInput-root": { 
                                            bgcolor: licenseStatus.bg,
                                            color: licenseStatus.color,
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            '& fieldset': { borderColor: licenseStatus.color },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SECTION 3: Сертификатууд */}
                <Box>
                    <SectionTitle icon={<VerifiedUser />} title="Сертификатууд" />
                    
                    {/* Warning */}
                    <Alert 
                        severity="info" 
                        icon={<Warning />}
                        sx={{ 
                            mb: 1.5, 
                            fontSize: '0.85rem',
                            py: 0.5,
                            '& .MuiAlert-icon': { fontSize: 18 },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Анхаар:</strong> Сертификат нэг байгууллагад л бүртгэгдэх боломжтой!
                        </Typography>
                    </Alert>
                    
                    <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={handleAddCertificate}
                            sx={{
                                bgcolor: COLORS.primary,
                                textTransform: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                '&:hover': { bgcolor: COLORS.navy }
                            }}
                        >
                            Сертификат нэмэх
                        </Button>
                    </Box>
                    
                    {certificates.map((cert, index) => (
                        <Paper 
                            key={index} 
                            elevation={0} 
                            sx={{ 
                                p: 1.5, 
                                mb: 1.5, 
                                bgcolor: COLORS.gray[50],
                                border: `1px solid ${COLORS.gray[200]}`, 
                                borderRadius: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.navy, fontSize: '0.8rem' }}>
                                    Сертификат #{index + 1}
                                </Typography>
                                {certificates.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveCertificate(index)}
                                        sx={{ 
                                            color: COLORS.danger,
                                            '&:hover': { bgcolor: '#ffebee' }
                                        }}
                                    >
                                        <Delete sx={{ fontSize: 16 }} />
                                    </IconButton>
                                )}
                            </Box>
                            
                            <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        size="small"
                                        label="Сертификат"
                                        value={cert.certificate}
                                        onChange={(e) => handleCertificateChange(index, 'certificate', e.target.value)}
                                        placeholder="ISO 27001:2022"
                                        InputLabelProps={{ shrink: true }}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        size="small"
                                        label="Хугацаа дуусах огноо"
                                        value={cert.expireDate}
                                        onChange={(e) => handleCertificateChange(index, 'expireDate', e.target.value)}
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        size="small"
                                        label="Эзэмшигч"
                                        value={cert.owner}
                                        onChange={(e) => handleCertificateChange(index, 'owner', e.target.value)}
                                        placeholder="Б.Батаа"
                                        InputLabelProps={{ shrink: true }}
                                        sx={textFieldStyle}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>

                {/* SECTION 4: Холбоо барих */}
                <Box>
                    <SectionTitle icon={<AccountCircle />} title="Холбоо барих" />
                    
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Холбоо барих утас"
                                    name="contact_phone"
                                    value={form.contact_phone || ""}
                                    onChange={onChange}
                                    type="tel"
                                    placeholder="99112233"
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Цахим шуудан"
                                    name="email"
                                    value={form.email || ""}
                                    onChange={onChange}
                                    type="email"
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SECTION 5: Нэмэлт мэдээлэл */}
                <Box sx={{ mb: 1 }}>
                    <SectionTitle icon={<Description />} title="Нэмэлт мэдээлэл" />
                    
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: COLORS.gray[50], borderRadius: 1 }}>
                        <TextField 
                            fullWidth 
                            size="small"
                            label="Нэмэлт тайлбар"
                            name="reporting_org"
                            value={form.reporting_org || ""}
                            onChange={onChange}
                            multiline
                            rows={3}
                            InputLabelProps={{ shrink: true }}
                            sx={textFieldStyle}
                            placeholder="Байгууллагын тухай нэмэлт мэдээлэл..."
                        />
                    </Paper>
                </Box>
            </DialogContent>
            
            {/* FOOTER - matching ReportModal */}
            <DialogActions sx={{ 
                px: 2.5, 
                py: 1.5, 
                borderTop: `1px solid ${COLORS.gray[200]}`,
                bgcolor: 'white',
            }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<Close />}
                    sx={{ 
                        textTransform: "none", 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderColor: COLORS.gray[300],
                        color: COLORS.gray[700],
                        '&:hover': {
                            borderColor: COLORS.navy,
                            bgcolor: COLORS.gray[50],
                        }
                    }}
                >
                    Болих
                </Button>
                <Button 
                    onClick={handleSaveWithCertificates}
                    variant="contained" 
                    startIcon={<CheckCircle />}
                    sx={{ 
                        textTransform: "none", 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.navy },
                    }}
                >
                    {isEdit ? 'Хадгалах' : 'Нэмэх'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}