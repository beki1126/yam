// ============================================
// SIDEBAR - Premium Visual Design with Animations
// ============================================

import React from "react";
import {
    Box, List, ListItemButton, ListItemIcon,
    ListItemText, Typography, Divider, Avatar, Badge
} from "@mui/material";

import {
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    Security as SecurityIcon,
    Circle as CircleIcon
} from "@mui/icons-material";

// 🎨 САЙЖРУУЛСАН THEME
const theme = {
    primary: {
        main: '#0A66C2',
        light: '#2E8BC0',
        dark: '#084B8A',
        surface: '#F0F7FF',
        gradient: 'linear-gradient(135deg, #0A66C2 0%, #2E8BC0 100%)',
    },
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
    danger: {
        main: '#DC2626',
        light: '#FEF2F2',
    },
    background: {
        sidebar: '#FFFFFF',
        hover: '#F8FAFC',
    }
};

// 🎯 KEYFRAMES
const keyframes = {
    '@keyframes slideInLeft': {
        from: {
            opacity: 0,
            transform: 'translateX(-20px)',
        },
        to: {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },
    '@keyframes fadeIn': {
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
    },
    '@keyframes pulse': {
        '0%, 100%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.8,
        },
    },
    '@keyframes glow': {
        '0%, 100%': {
            boxShadow: '0 0 20px rgba(10, 102, 194, 0.3)',
        },
        '50%': {
            boxShadow: '0 0 30px rgba(10, 102, 194, 0.5)',
        },
    },
};

const menuItems = [
    { 
        text: "Үндсэн Самбар", 
        icon: <DashboardIcon />, 
        path: "/dashboard",
        badge: null // Жишээ: badge: 5
    },
];

export default function Sidebar({ onLogout, activePath = "/dashboard", user = null }) {

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.background.sidebar,
                position: 'relative',
                overflow: 'hidden',
                ...keyframes,
                
                // Сайн мэдрэгдэх shadow
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
                
                // Gradient accent зурвас
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: theme.primary.gradient,
                }
            }}
        >
            {/* LOGO SECTION - Premium брэнд хэсэг */}
            <Box sx={{ 
                px: 3, 
                py: 4,
                position: 'relative',
                animation: 'slideInLeft 0.6s ease-out both',
                animationDelay: '0.1s',
            }}>
                {/* Background decoration */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background: `radial-gradient(circle, ${theme.primary.surface} 0%, transparent 70%)`,
                    opacity: 0.5,
                    pointerEvents: 'none',
                }} />
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: 'relative' }}>
                    {/* Logo Icon with glow effect */}
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: theme.primary.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        animation: 'glow 3s ease-in-out infinite',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05) rotate(-5deg)',
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: '-2px',
                            borderRadius: 3,
                            background: theme.primary.gradient,
                            opacity: 0.3,
                            filter: 'blur(8px)',
                            zIndex: -1,
                        }
                    }}>
                        <SecurityIcon sx={{ color: 'white', fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                    </Box>

                    {/* Text Section */}
                    <Box>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 800, 
                            color: theme.neutral[900],
                            fontSize: '1.25rem',
                            lineHeight: 1,
                            letterSpacing: '-0.5px',
                            mb: 0.5,
                            background: theme.primary.gradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            АУДИТ
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ 
                                color: theme.neutral[500], 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            Бүртгэлийн систем
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ 
                borderColor: theme.neutral[100],
                mx: 2,
                opacity: 0.6,
            }} />

            {/* MENU SECTION - Сайжруулсан animations */}
            <List sx={{ 
                px: 2.5, 
                pt: 3, 
                flexGrow: 1,
            }}>
                {menuItems.map((item, index) => {
                    const active = activePath === item.path;

                    return (
                        <ListItemButton
                            key={item.text}
                            sx={{
                                mb: 1.5,
                                py: 1.75,
                                px: 2.5,
                                borderRadius: 3,
                                position: 'relative',
                                overflow: 'hidden',
                                animation: 'slideInLeft 0.6s ease-out both',
                                animationDelay: `${0.2 + index * 0.1}s`,
                                
                                // Active state
                                background: active 
                                    ? theme.primary.gradient
                                    : 'transparent',
                                color: active ? 'white' : theme.neutral[700],
                                boxShadow: active 
                                    ? '0 4px 16px rgba(10, 102, 194, 0.25)' 
                                    : 'none',
                                
                                // Hover effect
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    background: active 
                                        ? theme.primary.gradient
                                        : theme.background.hover,
                                    transform: 'translateX(8px)',
                                    boxShadow: active 
                                        ? '0 6px 20px rgba(10, 102, 194, 0.35)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                },
                                
                                // Active indicator
                                '&::before': active ? {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '4px',
                                    height: '60%',
                                    bgcolor: 'white',
                                    borderRadius: '0 2px 2px 0',
                                    animation: 'pulse 2s ease-in-out infinite',
                                } : {},
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: active ? 'white' : theme.neutral[500],
                                    minWidth: 44,
                                    transition: 'all 0.3s ease',
                                    '& svg': {
                                        fontSize: 24,
                                        filter: active 
                                            ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                                            : 'none',
                                    }
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: active ? 700 : 600,
                                    fontSize: '0.95rem',
                                    color: 'inherit',
                                    letterSpacing: '-0.2px',
                                }}
                            />
                            
                            {/* Badge (optional) */}
                            {item.badge && (
                                <Badge 
                                    badgeContent={item.badge} 
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            bgcolor: active ? 'white' : theme.primary.main,
                                            color: active ? theme.primary.main : 'white',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            minWidth: 20,
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* USER INFO SECTION - Нэвтэрсэн хэрэглэгчийн мэдээлэл */}
            <Box sx={{ 
                px: 3, 
                py: 2.5,
                animation: 'fadeIn 0.8s ease-out both',
                animationDelay: '0.5s',
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: theme.neutral[50],
                    border: `1px solid ${theme.neutral[200]}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: theme.background.hover,
                        borderColor: theme.neutral[300],
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }
                }}>
                    <Avatar sx={{ 
                        width: 44, 
                        height: 44, 
                        bgcolor: theme.primary.main,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)',
                    }}>
                        {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Role */}
                        <Typography variant="body2" sx={{ 
                            fontWeight: 700, 
                            color: theme.neutral[900],
                            fontSize: '0.875rem',
                            lineHeight: 1.2,
                            mb: 0.5,
                        }}>
                            {user?.role === 'admin' ? 'Админ' : user?.role || 'Хэрэглэгч'}
                        </Typography>
                        
                        {/* Email */}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: theme.neutral[500],
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={user?.email || 'admin@example.com'}
                        >
                            {user?.email || 'admin@example.com'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* LOGOUT BUTTON - Premium дизайн */}
            <Box sx={{ 
                px: 2.5, 
                pb: 3,
                animation: 'slideInLeft 0.6s ease-out both',
                animationDelay: '0.6s',
            }}>
                <Divider sx={{ 
                    mb: 2.5, 
                    borderColor: theme.neutral[100],
                    opacity: 0.6,
                }} />
                
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: 3,
                        py: 1.75,
                        px: 2.5,
                        bgcolor: theme.danger.light,
                        border: `2px solid ${theme.danger.main}20`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        
                        '&:hover': {
                            bgcolor: theme.danger.main,
                            borderColor: theme.danger.main,
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.25)',
                            
                            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                color: 'white',
                            }
                        },
                        
                        // Ripple effect background
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 0,
                            height: 0,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translate(-50%, -50%)',
                            transition: 'width 0.6s, height 0.6s',
                        },
                        '&:hover::before': {
                            width: '300px',
                            height: '300px',
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        color: theme.danger.main, 
                        minWidth: 44,
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        zIndex: 1,
                        '& svg': {
                            fontSize: 24,
                        }
                    }}>
                        <LogoutIcon />
                    </ListItemIcon>

                    <ListItemText
                        primary="Гарах"
                        primaryTypographyProps={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: theme.danger.main,
                            transition: 'color 0.3s ease',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );
}