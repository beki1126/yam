// ============================================
// DATATABLE.JSX - Main Data Table Component
// ============================================

import React from "react";
import {
    Paper, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, IconButton, Tooltip, Box, Typography,
    CircularProgress, Alert
} from "@mui/material";
import {
    Assignment, AttachFile, Edit, Delete, Business, Policy
} from "@mui/icons-material";
import { motion } from "framer-motion";
import moment from "moment";
import { PRIMARY_BLUE, NAVY_COLOR, DISPLAY_COLUMNS } from "./constants";

export default function DataTable({ 
    rows,
    isLoading,
    fetchError,
    onViewReport,
    onAttachFile,
    onEdit,
    onDelete,
    getStatusChip,
    getLicenseChip,
    getLicenseMarker
}) {
    return (
        <TableContainer 
            component={Paper} 
            elevation={3}
            sx={{ 
                borderRadius: 2, 
                maxHeight: "calc(100vh - 320px)",
                overflowY: "auto",
                overflowX: "hidden",
                border: "1px solid #e0e0e0",
                background: "white"
            }}
        >
            <Table size="medium" stickyHeader>
                <TableHead>
                    <TableRow sx={{ background: "#eef2ff" }}>
                        {DISPLAY_COLUMNS.map(col => (
                            <TableCell 
                                key={col.key}
                                sx={{ 
                                    color: NAVY_COLOR, 
                                    fontWeight: 700, 
                                    textAlign: col.key === "id" ? "center" : "left",
                                    py: 1,
                                    px: 1,
                                    fontSize: "0.8rem",
                                    borderBottom: `2px solid ${PRIMARY_BLUE}`,
                                    whiteSpace: "nowrap",
                                    width: col.width,
                                    minWidth: col.width,
                                    maxWidth: col.width,
                                    position: "sticky",
                                    top: 0,
                                    backgroundColor: "#eef2ff",
                                    zIndex: 10
                                }}
                            >
                                {col.label}
                            </TableCell>
                        ))}
                        {["Статус", "Үйлдэл"].map(h => (
                            <TableCell 
                                key={h} 
                                sx={{ 
                                    color: NAVY_COLOR, 
                                    fontWeight: 700, 
                                    textAlign: "center",
                                    py: 1.5,
                                    px: 1,
                                    fontSize: "0.85rem",
                                    borderBottom: `2px solid ${PRIMARY_BLUE}`,
                                    whiteSpace: "nowrap",
                                    width: h === "Статус" ? "120px" : "150px",
                                    minWidth: h === "Статус" ? "120px" : "150px",
                                    maxWidth: h === "Статус" ? "120px" : "150px",
                                    position: "sticky",
                                    top: 0,
                                    backgroundColor: "#eef2ff",
                                    zIndex: 10
                                }}
                            >
                                {h}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={DISPLAY_COLUMNS.length + 2} align="center" sx={{ py: 5, color: PRIMARY_BLUE }}>
                                <CircularProgress size={24} sx={{ mr: 2 }} /> Мэдээлэл татаж байна...
                            </TableCell>
                        </TableRow>
                    ) : fetchError ? (
                        <TableRow>
                            <TableCell colSpan={DISPLAY_COLUMNS.length + 2} align="center" sx={{ py: 5 }}>
                                <Alert severity="error" sx={{ justifyContent: 'center' }}>
                                    {fetchError}
                                </Alert>
                            </TableCell>
                        </TableRow>
                    ) : rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={DISPLAY_COLUMNS.length + 2} align="center" sx={{ py: 5, color: "#999" }}>
                                Бүртгэлд мэдээлэл олдсонгүй.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows
                            .filter(row => row.org_name && row.org_name.trim() !== '')
                            .map((row, index) => {
                            const exp = moment(row.license_expire_date).diff(moment(), "days");
                            const isExpired = exp < 0;
                            const isWarning = exp >= 0 && exp <= 30;

                            return (
                                <motion.tr 
                                    key={row.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ 
                                        backgroundColor: isExpired ? "#ffebee" : "#eef2ff", 
                                        transition: { duration: 0.1 } 
                                    }}
                                    style={{ 
                                        display: "table-row", 
                                        borderBottom: "1px solid #f0f0f0",
                                        backgroundColor: isExpired ? "#ffebee" : (isWarning ? "#fff3e0" : "white"),
                                        borderLeft: isExpired ? "4px solid #f44336" : (isWarning ? "4px solid #ff9800" : "4px solid #4caf50")
                                    }}
                                >
                                    {DISPLAY_COLUMNS.map(col => (
                                        <TableCell 
                                            key={col.key} 
                                            sx={{ 
                                                color: "#333", 
                                                fontSize: "0.8rem",
                                                px: 1,
                                                py: 1,
                                                width: col.width,
                                                minWidth: col.width,
                                                maxWidth: col.width,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {col.key === "id" ? (
                                                // ✅ ӨӨРЧЛӨЛТ: index + 1 ашиглан 1-ээс эхлүүлэх
                                                <Box sx={{ textAlign: "center", fontWeight: 600, color: PRIMARY_BLUE }}>
                                                    {index + 1}
                                                </Box>
                                            ) : col.key === "org_name" ? ( 
                                                <Tooltip title={row.org_name} placement="top">
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
                                                        <Business sx={{ fontSize: 16, color: NAVY_COLOR, flexShrink: 0 }} />
                                                        <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {row.org_name}
                                                        </Box>
                                                        {getLicenseMarker(row.license_type)} 
                                                    </Box>
                                                </Tooltip>
                                            ) : col.key === "registration_number" ? (
                                                <Tooltip title={row.registration_number || '—'} placement="top">
                                                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {row.registration_number || '—'}
                                                    </Box>
                                                </Tooltip>
                                            ) : col.key === "license_expire_date" ? (
                                                <Box sx={{ fontSize: '0.8rem' }}>
                                                    {moment(row[col.key]).isValid() ? moment(row[col.key]).format('YYYY-MM-DD') : '—'}
                                                </Box>
                                            ) : (
                                                <Tooltip title={row[col.key] || '—'} placement="top">
                                                    <span>{row[col.key] || '—'}</span>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    ))}
                                    
                                    <TableCell sx={{ 
                                        textAlign: "center", 
                                        fontWeight: 600,
                                        px: 1,
                                        py: 1.5,
                                        width: "120px",
                                        minWidth: "120px",
                                        maxWidth: "120px"
                                    }}>
                                        {getStatusChip(row.license_expire_date)}
                                    </TableCell>
                                    
                                    <TableCell sx={{ 
                                        textAlign: "center",
                                        px: 0.5,
                                        py: 1,
                                        width: "180px",
                                        minWidth: "180px",
                                        maxWidth: "180px"
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                            <Tooltip title="Дэлгэрэнгүй">
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); onViewReport(row); }} 
                                                    sx={{ 
                                                        color: PRIMARY_BLUE,
                                                        padding: '4px',
                                                        "&:hover": { bgcolor: "#eef2ff" }
                                                    }}
                                                >
                                                    <Assignment fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title={row.attachment_filename ? "Хавсралт" : "Файл"}>
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); onAttachFile(row); }} 
                                                    sx={{ 
                                                        color: row.attachment_filename ? "success.main" : PRIMARY_BLUE,
                                                        padding: '4px',
                                                        "&:hover": { bgcolor: "#eef2ff" }
                                                    }}
                                                >
                                                    <AttachFile fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Засах">
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); onEdit(row); }} 
                                                    sx={{ 
                                                        color: PRIMARY_BLUE,
                                                        padding: '4px',
                                                        "&:hover": { bgcolor: "#eef2ff" }
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Устгах">
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        onDelete(row.id);
                                                    }} 
                                                    sx={{ 
                                                        color: "error.main",
                                                        padding: '4px',
                                                        "&:hover": { bgcolor: "#ffebee" }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </motion.tr>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}