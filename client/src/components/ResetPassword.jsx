import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    VpnKey, 
    Visibility, 
    VisibilityOff, 
    CheckCircle, 
    LockReset, 
    Check, 
    Close,
    Error as ErrorIcon,
    Security
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import backgroundImage from '../images/background.png';

const PRIMARY_BLUE = "#007BFF";
const NAVY_COLOR = "#053B50";
const ACCENT_COLOR = "#3399FF";
const DANGER_COLOR = "#d32f2f";
const SUCCESS_COLOR = "#28a745";
const WARNING_COLOR = "#ff9800";

const formVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" } 
    },
    exit: { 
        opacity: 0, 
        scale: 0.9,
        y: 50,
        transition: { duration: 0.3 } 
    }
};

const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
            type: "spring",
            stiffness: 200,
            damping: 15
        } 
    }
};

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);
    
    // Auto-dismiss error
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Countdown for redirect
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            navigate('/login');
        }
    }, [success, countdown, navigate]);

    // Password strength calculation
    const calculatePasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '', width: 0 };
        
        let score = 0;
        
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        const maxScore = 7;
        const percentage = (score / maxScore) * 100;
        
        if (score <= 2) return { score, label: 'Сул', color: DANGER_COLOR, width: percentage };
        if (score <= 4) return { score, label: 'Дунд', color: WARNING_COLOR, width: percentage };
        if (score <= 5) return { score, label: 'Сайн', color: PRIMARY_BLUE, width: percentage };
        return { score, label: 'Маш сайн', color: SUCCESS_COLOR, width: percentage };
    };
    
    const passwordStrength = calculatePasswordStrength(newPassword);
    const passwordsMatch = confirmPassword && newPassword === confirmPassword;
    
    // Password requirements - Updated to include special character requirement
    const requirements = [
        { label: 'Дор хаяж 6 тэмдэгт', test: newPassword.length >= 6 },
        { label: 'Тусгай тэмдэгт (!@#$%^&*...)', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
        { label: 'Жижиг үсэг (a-z)', test: /[a-z]/.test(newPassword) },
        { label: 'Том үсэг (A-Z)', test: /[A-Z]/.test(newPassword) },
        { label: 'Тоо (0-9)', test: /[0-9]/.test(newPassword) },
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // Нууц үг хоосон эсэх шалгах
        if (!newPassword || newPassword.trim() === '') {
            setError('Нууц үг хоосон байж болохгүй.');
            return;
        }

        // Нууц үгийн урт шалгах
        if (newPassword.length < 6) {
            setError('Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.');
            return;
        }

        // Тусгай тэмдэгт шалгах
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (!specialCharRegex.test(newPassword)) {
            setError('Нууц үг ядаж нэг тусгай тэмдэгт агуулсан байх ёстой (!@#$%^&*...)');
            return;
        }

        // Нууц үг таарч байгаа эсэх шалгах
        if (newPassword !== confirmPassword) {
            setError('Нууц үг таарахгүй байна.');
            return;
        }

        setLoading(true);

        try {
            await api.post(`/auth/reset-password-confirm/${token}`, {
                newPassword
            });
            
            setSuccess(true);
            
        } catch (err) {
            console.error('Reset password error:', err);
            const errorMessage = err.response?.data?.message || 
                'Нууц үг солиход алдаа гарлаа. Токен хүчингүй эсвэл хугацаа нь дууссан байж магадгүй.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const formStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '480px',
        border: `1px solid rgba(255, 255, 255, 0.5)`,
        position: 'relative',
        overflow: 'hidden',
    };

    const topBar = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${PRIMARY_BLUE}, ${ACCENT_COLOR})`,
    };

    const inputContainerStyle = {
        marginBottom: '25px',
        position: 'relative',
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 15px',
        paddingRight: '45px',
        borderRadius: '12px',
        border: '2px solid rgba(0, 123, 255, 0.2)',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
    };

    const focusInputStyle = {
        borderColor: PRIMARY_BLUE,
        boxShadow: `0 0 0 4px ${PRIMARY_BLUE}15`,
        background: 'rgba(255, 255, 255, 0.95)',
    };

    const buttonStyle = {
        width: '100%',
        padding: '15px',
        background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${ACCENT_COLOR})`,
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '17px',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        opacity: loading ? 0.8 : 1,
        marginTop: '10px',
        boxShadow: `0 8px 25px ${PRIMARY_BLUE}40`,
    };

    const toggleButtonStyle = {
        position: 'absolute',
        right: '12px',
        top: '38px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        transition: 'color 0.2s',
    };
    
    const Notification = ({ message, type = 'error' }) => (
        <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{ 
                color: type === 'error' ? DANGER_COLOR : SUCCESS_COLOR,
                background: type === 'error' ? 'rgba(255, 235, 238, 0.95)' : 'rgba(232, 245, 233, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: `2px solid ${type === 'error' ? DANGER_COLOR : SUCCESS_COLOR}30`,
                fontSize: '14px',
                fontWeight: '500',
            }}
        >
            {type === 'error' ? (
                <ErrorIcon sx={{ fontSize: 22 }} />
            ) : (
                <CheckCircle sx={{ fontSize: 22 }} />
            )}
            <span style={{ flex: 1 }}>{message}</span>
        </motion.div>
    );
    
    // Password Strength Bar Component
    const PasswordStrengthBar = () => {
        if (!newPassword) return null;
        
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: '12px' }}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '6px'
                }}>
                    <span style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>
                        Нууц үгийн хүч:
                    </span>
                    <span style={{ 
                        fontSize: '13px', 
                        fontWeight: '700',
                        color: passwordStrength.color 
                    }}>
                        {passwordStrength.label}
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.width}%` }}
                        transition={{ duration: 0.3 }}
                        style={{
                            height: '100%',
                            background: passwordStrength.color,
                            borderRadius: '4px'
                        }}
                    />
                </div>
            </motion.div>
        );
    };
    
    // Password Requirements Checklist
    const PasswordRequirements = () => {
        if (!newPassword) return null;
        
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                    marginTop: '15px',
                    padding: '14px',
                    background: 'rgba(245, 245, 245, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
            >
                <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: NAVY_COLOR, 
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Security sx={{ fontSize: 16 }} />
                    Нууц үгийн шаардлага:
                </div>
                {requirements.map((req, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            fontSize: '12px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {req.test ? (
                                <Check sx={{ fontSize: 18, color: SUCCESS_COLOR }} />
                            ) : (
                                <Close sx={{ fontSize: 18, color: '#bbb' }} />
                            )}
                        </motion.div>
                        <span style={{ 
                            color: req.test ? SUCCESS_COLOR : '#666',
                            fontWeight: req.test ? '600' : '400',
                            transition: 'all 0.3s ease'
                        }}>
                            {req.label}
                        </span>
                    </motion.div>
                ))}
            </motion.div>
        );
    };
    
    // Password Match Indicator
    const PasswordMatchIndicator = () => {
        if (!confirmPassword) return null;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: passwordsMatch ? 'rgba(232, 245, 233, 0.8)' : 'rgba(255, 235, 238, 0.8)',
                    border: `1px solid ${passwordsMatch ? SUCCESS_COLOR : DANGER_COLOR}30`,
                }}
            >
                {passwordsMatch ? (
                    <>
                        <CheckCircle sx={{ fontSize: 18, color: SUCCESS_COLOR }} />
                        <span style={{ color: SUCCESS_COLOR, fontWeight: '600' }}>
                            Нууц үг таарч байна
                        </span>
                    </>
                ) : (
                    <>
                        <ErrorIcon sx={{ fontSize: 18, color: DANGER_COLOR }} />
                        <span style={{ color: DANGER_COLOR, fontWeight: '500' }}>
                            Нууц үг таарахгүй байна
                        </span>
                    </>
                )}
            </motion.div>
        );
    };

    const handleMouseOver = (e) => {
        if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 12px 30px ${PRIMARY_BLUE}50`;
        }
    };

    const handleMouseOut = (e) => {
        if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 8px 25px ${PRIMARY_BLUE}40`;
        }
    };

    // Success Screen
    if (success) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                padding: '20px',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(2px)',
                }} />

                <motion.div
                    style={formStyle}
                    variants={successVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div style={topBar}></div>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        >
                            <CheckCircle 
                                sx={{ fontSize: 90, color: SUCCESS_COLOR, mb: 2 }} 
                                style={{ filter: `drop-shadow(0 4px 15px ${SUCCESS_COLOR}50)` }}
                            />
                        </motion.div>
                        
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ 
                                color: NAVY_COLOR, 
                                fontSize: '28px', 
                                fontWeight: '800',
                                margin: '15px 0',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            Амжилттай!
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ 
                                color: '#555', 
                                fontSize: '16px',
                                lineHeight: '1.6',
                                marginBottom: '25px'
                            }}
                        >
                            Таны нууц үг амжилттай шинэчлэгдлээ.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'rgba(240, 248, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '2px solid rgba(0, 123, 255, 0.2)',
                            }}
                        >
                            <p style={{ 
                                color: NAVY_COLOR, 
                                fontSize: '15px',
                                fontWeight: '600',
                                margin: 0,
                                marginBottom: '10px'
                            }}>
                                🔐 Та одоо шинэ нууц үгээрээ нэвтрэх боломжтой
                            </p>
                            <p style={{ 
                                color: '#666', 
                                fontSize: '14px',
                                margin: 0
                            }}>
                                Нэвтрэх хуудас руу шилжих: <strong style={{ 
                                    color: PRIMARY_BLUE,
                                    fontSize: '20px'
                                }}>{countdown}</strong> секунд
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ marginTop: '20px' }}
                        >
                            <CircularProgress 
                                size={30} 
                                sx={{ color: PRIMARY_BLUE }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main Form
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            padding: '20px',
            position: 'relative',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(2px)',
            }} />

            <motion.form
                onSubmit={handleSubmit}
                style={formStyle}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={formVariants}
            >
                <div style={topBar}></div>

                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
                    >
                        <LockReset 
                            sx={{ fontSize: 65, color: PRIMARY_BLUE, mb: 1.5 }}
                            style={{ filter: `drop-shadow(0 4px 15px ${PRIMARY_BLUE}60)` }}
                        />
                    </motion.div>
                    <h2 style={{ 
                        color: NAVY_COLOR,
                        fontSize: '32px',
                        fontWeight: '800',
                        margin: '10px 0 8px 0',
                        letterSpacing: '-0.5px',
                    }}>
                        Шинэ нууц үг үүсгэх
                    </h2>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#555',
                        lineHeight: '1.6',
                        fontWeight: '500'
                    }}>
                        Аюулгүй нууц үгээ үүсгэж, баталгаажуулна уу
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && <Notification key="error" message={error} type="error" />}
                </AnimatePresence>

                {/* Шинэ нууц үг */}
                <div style={inputContainerStyle}>
                    <label htmlFor="new-password" style={{ 
                        fontSize: '14px', 
                        color: NAVY_COLOR, 
                        fontWeight: '600',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        Шинэ нууц үг
                    </label>
                    <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={inputStyle}
                        placeholder="Шинэ нууц үгээ оруулна уу"
                        onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 123, 255, 0.2)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        }}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        style={toggleButtonStyle}
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseOver={(e) => e.currentTarget.style.color = PRIMARY_BLUE}
                        onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                        aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                    >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 22 }} /> : <Visibility sx={{ fontSize: 22 }} />}
                    </button>
                    
                    <PasswordStrengthBar />
                    <PasswordRequirements />
                </div>

                {/* Нууц үг баталгаажуулах */}
                <div style={inputContainerStyle}>
                    <label htmlFor="confirm-password" style={{ 
                        fontSize: '14px', 
                        color: NAVY_COLOR, 
                        fontWeight: '600',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        Нууц үг баталгаажуулах
                    </label>
                    <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                        placeholder="Нууц үгээ дахин оруулна уу"
                        onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 123, 255, 0.2)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        }}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        style={toggleButtonStyle}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseOver={(e) => e.currentTarget.style.color = PRIMARY_BLUE}
                        onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                        aria-label={showConfirmPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                    >
                        {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 22 }} /> : <Visibility sx={{ fontSize: 22 }} />}
                    </button>
                    
                    <PasswordMatchIndicator />
                </div>

                <motion.button 
                    type="submit" 
                    style={buttonStyle}
                    disabled={loading}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ color: '#fff' }} />
                            Солиж байна...
                        </>
                    ) : (
                        <>
                            <VpnKey sx={{ fontSize: 20 }} />
                            Нууц үг солих
                        </>
                    )}
                </motion.button>
            </motion.form>
        </div>
    );
}