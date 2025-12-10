// ============================================
// DELETEMODAL.JSX - Clean Minimal Design
// ============================================

import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, IconButton, Fade
} from "@mui/material";
import { Close, DeleteOutline, WarningAmber } from "@mui/icons-material";

export default function DeleteModal({ open, orgName, onClose, onConfirm }) {

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                        Байгууллага устгах
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
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
                        <strong style={{ fontWeight: 600 }}>"{orgName}"</strong> байгууллагыг устгах гэж байна.
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
                            Дараах зүйлс устах болно:
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
                            <li>Бүх өгөгдөл болон файлууд</li>
                            <li>Хэрэглэгчдийн эрх ба тохиргоо</li>
                            <li>Түүх болон бүртгэлүүд</li>
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
                    onClick={onClose}
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
                    onClick={onConfirm}
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
    );
}