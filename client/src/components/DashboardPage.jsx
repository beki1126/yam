import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import moment from "moment";
import { notification } from 'antd';
import 'antd/dist/reset.css';
import {
    AppBar, Toolbar, Typography, Box, Button, TextField,
    IconButton, Grid, FormControl, InputLabel, Select, MenuItem,
    ListItemIcon, ListItemText, Alert, Tooltip, Chip, Paper
} from "@mui/material";
import {
    Add as AddIcon, Menu as MenuIcon, FileDownload, Description,
    Shield, VerifiedUser, Warning, Error as ErrorIcon,
    CheckCircle, Info, Search as SearchIcon, TrendingUp
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Import all components
import Sidebar from "./dashboard/Sidebar";
import MetricCard from "./dashboard/MetricCard";
import DeleteModal from "./dashboard/DeleteModal";
import AttachFileModal from "./dashboard/AttachFileModal";
import ReportModal from "./dashboard/ReportModal";
import AddEditModal from "./dashboard/AddEditModal";
import DataTable from "./dashboard/DataTable";

// Import constants and utils
import { 
    PRIMARY_BLUE, 
    NAVY_COLOR, 
    LICENSE_TYPES,
    INITIAL_FORM_STATE 
} from "./dashboard/constants";
import { 
    showNotification, 
    convertLicenseTypeToArray,
    formatDateForInput,
    sortRows 
} from "./dashboard/utils";

// 🎨 САЙЖРУУЛСАН ӨНГӨНИЙ ПАЛИТР - CSS Variables ашиглах
const theme = {
    // Primary Colors
    primary: {
        main: '#0A66C2',
        light: '#2E8BC0',
        dark: '#084B8A',
        surface: '#F0F7FF',
    },
    // Semantic Colors
    success: {
        main: '#059669',
        light: '#34D399',
        surface: '#ECFDF5',
    },
    warning: {
        main: '#F59E0B',
        light: '#FCD34D',
        surface: '#FFFBEB',
    },
    danger: {
        main: '#DC2626',
        light: '#F87171',
        surface: '#FEF2F2',
    },
    // Neutrals
    neutral: {
        50: '#FAFBFC',
        100: '#F5F7FA',
        200: '#E8ECF1',
        300: '#D4DBE5',
        400: '#9BA8B8',
        500: '#6B7A8F',
        600: '#4A5568',
        700: '#2D3748',
        800: '#1A202C',
        900: '#0F172A',
    },
    // Background & Surface
    background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
    },
};

// Sidebar-ын өргөн
const SIDEBAR_WIDTH = 270;

// 🎯 GLOBAL STYLES
const globalStyles = {
    '@keyframes fadeInUp': {
        from: {
            opacity: 0,
            transform: 'translateY(20px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
    '@keyframes slideInRight': {
        from: {
            opacity: 0,
            transform: 'translateX(-20px)',
        },
        to: {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },
    '@keyframes pulse': {
        '0%, 100%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.7,
        },
    },
};

export default function DashboardPage({ token, onLogout }) {
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [user, setUser] = useState(null);
    
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showReport, setShowReport] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    const [showAttachModal, setShowAttachModal] = useState(false);
    const [selectedOrgForAttach, setSelectedOrgForAttach] = useState(null);
    
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    
    const [selectedFilterLicense, setSelectedFilterLicense] = useState("All");
    
    const [form, setForm] = useState(INITIAL_FORM_STATE);

    // Decode token to get user info
    useEffect(() => {
        if (token) {
            try {
                // JWT token-ийг decode хийх (base64)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const decoded = JSON.parse(jsonPayload);
                setUser({
                    email: decoded.email || decoded.sub || 'admin@example.com',
                    role: decoded.role || 'admin',
                    userId: decoded.user_id || decoded.id,
                });
            } catch (err) {
                console.error('Token decode error:', err);
                setUser({ email: 'admin@example.com', role: 'admin' });
            }
        }
    }, [token]);

    // Fetch data
    const fetchData = () => {
        if (!token) {
            setIsLoading(false);
            setFetchError("Системд нэвтрээгүй байна. Дахин нэвтэрнэ үү.");
            return;
        }
        
        setIsLoading(true);
        setFetchError(null);
        
        const params = { q };
        if (selectedFilterLicense !== "All") {
            params.license_type = selectedFilterLicense;
        }
    
        api.get("/organizations", { params, headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                const rawData = r.data.data || [];
                
                if (!Array.isArray(rawData)) {
                    console.error("Response буруу:", rawData);
                    setFetchError("Серверээс буруу өгөгдөл ирлээ.");
                    setRows([]);
                    return;
                }
                
                const convertedRows = rawData.map(row => ({
                    ...row,
                    license_type: convertLicenseTypeToArray(row.license_type)
                }));
                
                setRows(sortRows(convertedRows));
            })
            .catch(e => {
                console.error("Мэдээлэл татах алдаа:", e);
                setFetchError(e.response?.data?.message || "Мэдээлэл татаж чадсангүй.");
                setRows([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, [token, q, selectedFilterLicense]);

    const logout = () => { 
        localStorage.removeItem("token"); 
        onLogout(); 
    };
    
    const handleInputChange = (e) => { 
        const { name, value } = e.target;
        
        if (name === "license_type") {
            setForm(prev => ({ 
                ...prev, 
                [name]: Array.isArray(value) ? value : [value] 
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleLicenseChange = (e) => {
        setSelectedFilterLicense(e.target.value);
    };
    
    const handleAddClick = () => {
        setAdding(true);
        setEditingId(null);
        setForm(INITIAL_FORM_STATE);
    };
    
    const handleEditClick = (row) => {
        console.log('handleEditClick called with row:', row);
        
        setEditingId(row.id);
        setAdding(false);
        
        const licenseArray = convertLicenseTypeToArray(row.license_type);

        const formData = {
            org_name: row.org_name || "",
            registration_number: row.registration_number || "",
            license_expire_date: formatDateForInput(row.license_expire_date),
            license_numbers: row.license_numbers || "",
            certificates: row.certificates || "",
            cert_expire_date: row.cert_expire_date || "",
            contact_person: row.contact_person || "",
            contact_phone: row.contact_phone || "",
            email: row.email || "",
            address: row.address || "",
            reporting_org: row.reporting_org || "",
            attachment_filename: row.attachment_filename || "",
            license_type: licenseArray,
        };
        
        console.log('Form data to set:', formData);
        console.log('📋 cert_expire_date:', formData.cert_expire_date);
        setForm(formData);
    };

    const handleSave = async (updatedForm) => {
        if (!token) {
            showNotification('warning', 'Анхааруулга', 'Системд нэвтэрсэн байх шаардлагатай.');
            return;
        }

        try {
            const { id, ...dataToSend } = updatedForm;
            
            const licenseTypeString = Array.isArray(dataToSend.license_type) 
                ? dataToSend.license_type.join(',')
                : dataToSend.license_type || '';

            const dataToSave = {
                ...dataToSend,
                license_type: licenseTypeString,
                license_expire_date: dataToSend.license_expire_date || null,
                cert_expire_date: dataToSend.cert_expire_date || null,
            };

            console.log("💾 Saving data:", dataToSave);
            console.log("📋 Certificates:", dataToSave.certificates);

            let response;
            if (editingId) {
                response = await api.put(`/organizations/${editingId}`, dataToSave, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await api.post("/organizations", dataToSave, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            const updatedRow = {
                ...response.data,
                license_type: convertLicenseTypeToArray(response.data.license_type)
            };

            if (editingId) {
                setRows(prev => {
                    const updated = prev.map(row => (row.id === editingId ? updatedRow : row));
                    return sortRows(updated);
                });
                setEditingId(null);
            } else {
                setRows(prev => sortRows([updatedRow, ...prev]));
                setAdding(false);
            }
            
            fetchData();
            
            showNotification('success', 'Амжилттай!', editingId ? 'Мэдээлэл шинэчлэгдлээ.' : 'Байгууллага нэмэгдлээ.');

        } catch (err) {
            console.error("Хадгалах алдаа:", err);
            const errorMessage = err.response?.data?.message || err.message || "Хадгалахад алдаа гарлаа.";
            showNotification('error', 'Алдаа гарлаа', errorMessage);
        }
    };
    
    const handleAttachClick = (row) => {
        setSelectedOrgForAttach(row);
        setShowAttachModal(true);
    };

    const updateOrgRow = (updatedOrg) => {
        const newOrg = { 
            ...updatedOrg, 
            license_type: convertLicenseTypeToArray(updatedOrg.license_type) 
        };

        setRows(prev => {
            const updated = prev.map(row => (row.id === newOrg.id ? newOrg : row));
            return sortRows(updated);
        });
        
        if (selectedOrgForAttach && selectedOrgForAttach.id === newOrg.id) {
            setSelectedOrgForAttach(newOrg);
        }
    };

    const handleDelete = async (id) => {
        const org = rows.find(r => r.id === id);
        const orgName = org?.org_name || 'энэ байгууллага';
        setDeleteModal({ open: true, id, name: orgName });
    };
    
    const confirmDelete = async () => {
        const { id } = deleteModal;
        
        try {
            const response = await api.delete(`/organizations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setRows(prev => prev.filter(row => row.id !== id));
                fetchData();
                setDeleteModal({ open: false, id: null, name: '' });
                showNotification('success', 'Амжилттай!', 'Байгууллага устгагдлаа.');
            }
        } catch (error) {
            console.error("Устгах алдаа:", error);
            setDeleteModal({ open: false, id: null, name: '' });
            
            if (error.response?.data?.error?.includes('foreign key constraint')) {
                showNotification('error', 'Устгах боломжгүй', 
                    'Энэ байгууллагад холбогдсон аудит бичлэгүүд байна.');
            } else {
                showNotification('error', 'Алдаа гарлаа', 
                    error.response?.data?.message || "Устгахад алдаа гарлаа.");
            }
        }
    };

    const getLicenseChip = (licenseKeys) => {
        const keysArray = Array.isArray(licenseKeys) ? licenseKeys : 
                          licenseKeys ? licenseKeys.split(',').map(s => s.trim()).filter(s => s) : [];

        if (keysArray.length === 0) return null;

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                {keysArray.map(key => {
                    const license = LICENSE_TYPES.find(lt => lt.key === key);
                    if (!license) return null;
                    
                    const shortLabel = license.label.split(' ')[0] + (license.label.includes('зөвшөөрөл') ? '' : '...');
                    
                    return (
                        <Tooltip key={key} title={license.label} arrow>
                            <Chip
                                label={shortLabel}
                                size="small"
                                sx={{ 
                                    fontWeight: 600, 
                                    fontSize: '0.7rem', 
                                    height: 24,
                                    bgcolor: theme.primary.main,
                                    color: 'white',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: theme.primary.dark,
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(10, 102, 194, 0.3)',
                                    }
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Box>
        );
    };

    const getLicenseMarker = (licenseKeys) => {
        const keysArray = Array.isArray(licenseKeys) ? licenseKeys : 
                          licenseKeys ? licenseKeys.split(',').map(s => s.trim()).filter(s => s) : [];

        if (keysArray.length === 0) return null;

        const firstLicense = LICENSE_TYPES.find(lt => lt.key === keysArray[0]);
        const icon = firstLicense?.icon || <Shield />; 
        
        const tooltipText = keysArray.map(key => {
            const license = LICENSE_TYPES.find(lt => lt.key === key);
            return license ? license.label : key;
        }).join('; ');
        
        return (
            <Tooltip title={tooltipText} arrow>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {React.cloneElement(icon, { 
                        sx: { 
                            fontSize: 20, 
                            color: theme.primary.main,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                color: theme.primary.dark,
                                transform: 'scale(1.1)',
                            }
                        } 
                    })}
                </Box>
            </Tooltip>
        );
    };

    const exportData = (type) => {
        const dataToExport = rows.map(({ id, created_at, updated_at, ...rest }) => ({
            "Байгууллагын нэр": rest.org_name,
            "Регистр": rest.registration_number,
            "Зөвшөөрлийн төрөл": Array.isArray(rest.license_type) ? rest.license_type.join(', ') : rest.license_type,
            "Зөвшөөрөл дуусах хугацаа": rest.license_expire_date,
            "Тушаалын огноо, дугаар": rest.license_numbers,
            "Сертификат": rest.certificates,
            "Сертификатын хугацаа": rest.cert_expire_date,
            "Сертификат эзэмшигч": rest.contact_person,
            "Холбоо барих": rest.contact_phone,
            "Цахим шуудан": rest.email,
            "Хаяг/Байршил": rest.address,
            "Нэмэлт тайлбар": rest.reporting_org,
        }));
        
        if (type === "excel") {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Байгууллагууд");
            const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            saveAs(new Blob([buffer]), "organizations.xlsx");
        } else if (type === "csv") {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), "organizations.csv");
        }
    };
    
    const getStatusChip = (expireDate) => {
        if (!expireDate || !moment(expireDate).isValid()) {
            return (
                <Chip
                    icon={<Info sx={{ fontSize: 16 }} />}
                    label="Хугацаагүй"
                    size="small"
                    sx={{ 
                        bgcolor: theme.neutral[200], 
                        color: theme.neutral[600], 
                        fontWeight: 600, 
                        fontSize: '0.7rem',
                        height: 26,
                        borderRadius: '8px',
                    }}
                />
            );
        }

        const today = moment().startOf('day');
        const expirationDate = moment(expireDate).startOf('day');
        const daysDiff = expirationDate.diff(today, "days");

        let status = "Хүчинтэй";
        let icon = <CheckCircle sx={{ fontSize: 16 }} />;
        let bgcolor = theme.success.main;
        let textColor = 'white';

        if (daysDiff < 0) {
            status = "Дууссан";
            icon = <ErrorIcon sx={{ fontSize: 16 }} />;
            bgcolor = theme.danger.main;
        } else if (daysDiff < 30) {
            status = `${daysDiff} хоног`;
            icon = <Warning sx={{ fontSize: 16 }} />;
            bgcolor = theme.warning.main;
            textColor = theme.neutral[800];
        }

        return (
            <Chip
                icon={icon}
                label={status}
                size="small"
                sx={{
                    bgcolor: bgcolor,
                    color: textColor,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 26,
                    borderRadius: '8px',
                    boxShadow: `0 2px 8px ${bgcolor}40`,
                    transition: 'all 0.2s ease',
                    '& .MuiChip-icon': {
                        color: textColor,
                    },
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${bgcolor}60`,
                    }
                }}
            />
        );
    };
    
    const metrics = useMemo(() => {
        let expired = 0;
        let warning = 0;
        let valid = 0;
        
        rows.forEach(row => {
            const exp = moment(row.license_expire_date).diff(moment(), "days");
            if (exp < 0) {
                expired++;
            } else if (exp < 30) {
                warning++;
            } else if (exp >= 30) {
                valid++;
            }
        });

        return { total: rows.length, expired, warning, valid };
    }, [rows]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <Box sx={{ 
            display: "flex", 
            minHeight: "100vh", 
            bgcolor: theme.background.default,
            position: "relative",
            ...globalStyles,
        }}>
            
            {/* SIDEBAR - Fixed positioning */}
            <Box
                sx={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: SIDEBAR_WIDTH,
                    transform: sidebarOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 1200,
                    bgcolor: "white",
                    boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
                }}
            >
                <Sidebar open={sidebarOpen} onLogout={logout} user={user} />
            </Box>
            
            {/* DELETE MODAL */}
            <DeleteModal
                open={deleteModal.open}
                orgName={deleteModal.name}
                onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
                onConfirm={confirmDelete}
            />

            {/* MAIN CONTENT - Responsive margin */}
            <Box sx={{ 
                flexGrow: 1, 
                ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
                transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                minWidth: 0,
                width: "100%",
            }}>
                
                {/* САЙЖРУУЛСАН APP BAR with gradient */}
                <AppBar 
                    position="sticky" 
                    elevation={0}
                    sx={{ 
                        background: `linear-gradient(135deg, ${theme.primary.main} 0%, ${theme.primary.dark} 100%)`,
                        backdropFilter: 'blur(10px)',
                        borderBottom: 'none',
                        boxShadow: '0 4px 24px rgba(10, 102, 194, 0.15)',
                    }}
                >
                    <Toolbar sx={{ py: 2, minHeight: '72px !important' }}>
                        <IconButton 
                            onClick={toggleSidebar} 
                            sx={{ 
                                mr: 2, 
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    transform: 'rotate(90deg)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    color: 'white', 
                                    fontWeight: 700,
                                    fontSize: '1.5rem',
                                    letterSpacing: '-0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Shield sx={{ fontSize: 32 }} />
                                Аудитын Бүртгэл
                            </Typography>
                            
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* САЙЖРУУЛСАН METRICS with animations */}
                <Box sx={{ px: { xs: 2, md: 4 }, pt: 4, pb: 3 }}>
                    <Grid container spacing={3}>
                        {[
                            { 
                                title: 'Нийт Байгууллага', 
                                value: metrics.total, 
                                icon: <Shield />, 
                                color: theme.primary.main,
                                bgColor: theme.primary.surface,
                                delay: '0s'
                            },
                            { 
                                title: 'Хүчинтэй', 
                                value: metrics.valid, 
                                icon: <VerifiedUser />, 
                                color: theme.success.main,
                                bgColor: theme.success.surface,
                                delay: '0.1s'
                            },
                            { 
                                title: 'Анхааруулга', 
                                value: metrics.warning, 
                                icon: <Warning />, 
                                color: theme.warning.main,
                                bgColor: theme.warning.surface,
                                delay: '0.2s'
                            },
                            { 
                                title: 'Дууссан', 
                                value: metrics.expired, 
                                icon: <ErrorIcon />, 
                                color: theme.danger.main,
                                bgColor: theme.danger.surface,
                                delay: '0.3s'
                            },
                        ].map((metric, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 3,
                                        bgcolor: theme.background.paper,
                                        border: `2px solid ${theme.neutral[100]}`,
                                        borderRadius: '16px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        animation: 'fadeInUp 0.6s ease-out both',
                                        animationDelay: metric.delay,
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 12px 32px ${metric.color}20`,
                                            borderColor: metric.color,
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            bgcolor: metric.bgColor,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {React.cloneElement(metric.icon, { 
                                                sx: { fontSize: 28, color: metric.color } 
                                            })}
                                        </Box>
                                        <TrendingUp sx={{ 
                                            fontSize: 20, 
                                            color: theme.neutral[300],
                                            opacity: 0.5,
                                        }} />
                                    </Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: theme.neutral[500], 
                                            fontWeight: 600, 
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block',
                                            mb: 1,
                                        }}
                                    >
                                        {metric.title}
                                    </Typography>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: theme.neutral[900],
                                            fontSize: '2.5rem',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {metric.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* САЙЖРУУЛСАН ALERTS with better styling */}
                {metrics.expired > 0 && (
                    <Box sx={{ 
                        px: { xs: 2, md: 4 }, 
                        mb: 2,
                        animation: 'slideInRight 0.5s ease-out both',
                        animationDelay: '0.4s',
                    }}>
                        <Alert 
                            severity="error" 
                            icon={<ErrorIcon />}
                            sx={{ 
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRadius: '12px',
                                border: `2px solid ${theme.danger.main}`,
                                bgcolor: theme.danger.surface,
                                '& .MuiAlert-icon': {
                                    fontSize: 24,
                                }
                            }}
                        >
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                🚨 ЯАРАЛТАЙ: 
                                <Box component="span" sx={{ 
                                    px: 1.5, 
                                    py: 0.5, 
                                    bgcolor: theme.danger.main, 
                                    color: 'white', 
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                }}>
                                    {metrics.expired}
                                </Box>
                                байгууллагын эрх дуусаасан байна!
                            </Box>
                        </Alert>
                    </Box>
                )}

                {metrics.warning > 0 && (
                    <Box sx={{ 
                        px: { xs: 2, md: 4 }, 
                        mb: 2,
                        animation: 'slideInRight 0.5s ease-out both',
                        animationDelay: '0.5s',
                    }}>
                        <Alert 
                            severity="warning" 
                            icon={<Warning />}
                            sx={{ 
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRadius: '12px',
                                border: `2px solid ${theme.warning.main}`,
                                bgcolor: theme.warning.surface,
                                '& .MuiAlert-icon': {
                                    fontSize: 24,
                                }
                            }}
                        >
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 
                                <Box component="span" sx={{ 
                                    px: 1.5, 
                                    py: 0.5, 
                                    bgcolor: theme.warning.main, 
                                    color: theme.neutral[900], 
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                }}>
                                    {metrics.warning}
                                </Box>
                                байгууллагын эрх 30 хоног дотор дуусна.
                            </Box>
                        </Alert>
                    </Box>
                )}

                {/* САЙЖРУУЛСАН SEARCH & FILTER BAR */}
                <Paper
                    elevation={0}
                    sx={{ 
                        mx: { xs: 2, md: 4 }, 
                        mb: 3, 
                        p: 3,
                        bgcolor: theme.background.paper,
                        border: `2px solid ${theme.neutral[100]}`,
                        borderRadius: '16px',
                        animation: 'fadeInUp 0.6s ease-out both',
                        animationDelay: '0.6s',
                    }}
                >
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        flexWrap: "wrap", 
                        gap: 2 
                    }}>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                            <TextField 
                                size="small" 
                                variant="outlined" 
                                placeholder="Байгууллагын нэр эсвэл регистрээр хайх..."
                                value={q} 
                                onChange={e => setQ(e.target.value)} 
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: theme.neutral[400], fontSize: 22 }} />
                                }}
                                sx={{ 
                                    minWidth: { xs: '100%', sm: 320 },
                                    "& .MuiOutlinedInput-root": {
                                        fontSize: '0.9rem',
                                        borderRadius: '12px',
                                        bgcolor: theme.neutral[50],
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: 'white',
                                            boxShadow: `0 0 0 3px ${theme.primary.surface}`,
                                        }
                                    }
                                }}
                            />
                            
                            <FormControl sx={{ minWidth: { xs: '100%', sm: 240 } }} size="small">
                                <InputLabel 
                                    id="license-filter-label" 
                                    sx={{ fontSize: '0.9rem' }}
                                >
                                    Зөвшөөрлийн төрөл
                                </InputLabel>
                                <Select
                                    labelId="license-filter-label"
                                    value={selectedFilterLicense}
                                    label="Зөвшөөрлийн төрөл"
                                    onChange={handleLicenseChange}
                                    sx={{ 
                                        fontSize: '0.9rem',
                                        borderRadius: '12px',
                                        bgcolor: theme.neutral[50],
                                        '&:hover': {
                                            bgcolor: 'white',
                                        }
                                    }}
                                    renderValue={(selected) => {
                                        const license = LICENSE_TYPES.find(lt => lt.key === selected);
                                        if (!license) return selected;
                                        
                                        // Богино хувилбар үүсгэх
                                        let shortLabel = license.label;
                                        if (license.key === 'All') {
                                            shortLabel = 'Бүх Зөвшөөрөл';
                                        } else if (license.label.includes('зөвшөөрөл')) {
                                            // "Тоон мэдээллийн кибер зөвшөөрөл" -> "Тоон / Кибер"
                                            const words = license.label.replace(' зөвшөөрөл', '').split(' мэдээллийн ');
                                            if (words.length === 2) {
                                                shortLabel = `${words[0]} / ${words[1]}`;
                                            } else {
                                                // Жишээ: "Аюулгүй байдлын аудитын зөвшөөрөл" -> "Аюулгүй / Аудит"
                                                const parts = license.label.replace(' зөвшөөрөл', '').split(' байдлын ');
                                                if (parts.length === 2) {
                                                    shortLabel = parts[0];
                                                } else {
                                                    shortLabel = license.label.split(' ')[0];
                                                }
                                            }
                                        }
                                        
                                        return shortLabel;
                                    }}
                                >
                                    {LICENSE_TYPES.map(license => {
                                        // Богино label үүсгэх
                                        let displayLabel = license.label;
                                        
                                        if (license.key !== 'All' && license.label.includes('зөвшөөрөл')) {
                                            const label = license.label.replace(' зөвшөөрөл', '');
                                            const parts = label.split(' мэдээллийн ');
                                            
                                            if (parts.length === 2) {
                                                // "Тоон мэдээллийн кибер" → "Тоон / Кибер"
                                                displayLabel = `${parts[0]} / ${parts[1]}`;
                                            } else {
                                                // "Аюулгүй байдлын аудитын" → "Аюулгүй / Аудит"
                                                const parts2 = label.split(' байдлын ');
                                                if (parts2.length === 2) {
                                                    const secondPart = parts2[1].split(' ')[0];
                                                    displayLabel = `${parts2[0]} / ${secondPart}`;
                                                } else {
                                                    displayLabel = label.split(' ')[0];
                                                }
                                            }
                                        }
                                        
                                        return (
                                            <MenuItem 
                                                key={license.key} 
                                                value={license.key} 
                                                sx={{ fontSize: '0.9rem' }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    {license.icon}
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={displayLabel} 
                                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} 
                                                />
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Box>
                        
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddClick}
                                sx={{
                                    bgcolor: theme.primary.main,
                                    textTransform: "none",
                                    px: 3,
                                    py: 1.2,
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    boxShadow: `0 4px 12px ${theme.primary.main}30`,
                                    transition: 'all 0.2s ease',
                                    "&:hover": { 
                                        bgcolor: theme.primary.dark,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 6px 20px ${theme.primary.main}40`,
                                    }
                                }}
                            >
                            Нэмэх
                            </Button>
                            <Tooltip title="Excel татах" arrow>
                                <IconButton 
                                    size="medium" 
                                    sx={{ 
                                        color: theme.success.main, 
                                        bgcolor: theme.success.surface,
                                        borderRadius: '12px',
                                        transition: 'all 0.2s ease',
                                        "&:hover": { 
                                            bgcolor: theme.success.main, 
                                            color: "white",
                                            transform: 'translateY(-2px)',
                                        } 
                                    }} 
                                    onClick={() => exportData('excel')}
                                >
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="CSV татах" arrow>
                                <IconButton 
                                    size="medium" 
                                    sx={{ 
                                        color: theme.primary.main, 
                                        bgcolor: theme.primary.surface,
                                        borderRadius: '12px',
                                        transition: 'all 0.2s ease',
                                        "&:hover": { 
                                            bgcolor: theme.primary.main, 
                                            color: "white",
                                            transform: 'translateY(-2px)',
                                        } 
                                    }} 
                                    onClick={() => exportData('csv')}
                                >
                                    <Description />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>

                {/* DATA TABLE with improved styling */}
                <Box sx={{ 
                    px: { xs: 2, md: 4 }, 
                    pb: 4,
                    animation: 'fadeInUp 0.6s ease-out both',
                    animationDelay: '0.7s',
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            overflow: 'hidden',
                            border: `2px solid ${theme.neutral[100]}`,
                            borderRadius: '16px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            }
                        }}
                    >
                        <DataTable
                            rows={rows}
                            isLoading={isLoading}
                            fetchError={fetchError}
                            onViewReport={(row) => setShowReport(row)}
                            onAttachFile={handleAttachClick}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            getStatusChip={getStatusChip}
                            getLicenseChip={getLicenseChip}
                            getLicenseMarker={getLicenseMarker}
                        />
                    </Paper>
                </Box>

                {/* REPORT MODAL */}
                <ReportModal
                    open={!!showReport}
                    report={showReport}
                    onClose={() => setShowReport(null)}
                    getStatusChip={getStatusChip}
                />

                {/* ATTACH FILE MODAL */}
                <AttachFileModal
                    open={showAttachModal}
                    org={selectedOrgForAttach}
                    onClose={() => setShowAttachModal(false)}
                    token={token}
                    onUpdateOrgRow={updateOrgRow}
                    onFetchData={fetchData}
                />

                {/* ADD/EDIT MODAL */}
                <AddEditModal
                    open={adding || !!editingId}
                    isEdit={!!editingId}
                    form={form}
                    onClose={() => { setAdding(false); setEditingId(null); }}
                    onChange={handleInputChange}
                    onSave={handleSave}
                />
                
            </Box>
        </Box>
    );
}