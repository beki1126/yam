import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LockReset, 
    ArrowBack, 
    Email,
    CheckCircle,
    Error as ErrorIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import backgroundImage from '../images/background.png'; // Зургийн замыг засах

const PRIMARY_BLUE = "#007BFF";
const NAVY_COLOR = "#053B50";
const ACCENT_COLOR = "#3399FF";
const DANGER_COLOR = "#d32f2f";
const SUCCESS_COLOR = "#28a745";

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

export default function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Автоматаар мессеж арилгах
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setMessage('');
        
        if (!email) {
            setError('Имэйл хаягаа оруулна уу.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message || 'Сэргээх линк таны имэйл руу илгээгдлээ.');
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
            setSuccess(false);
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
        maxWidth: '440px',
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
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 15px',
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
            {/* Overlay */}
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

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="form-content"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
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
                                    Нууц үг сэргээх
                                </h2>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '13px', 
                                    color: '#555',
                                    lineHeight: '1.6',
                                    fontWeight: '500',
                                    maxWidth: '350px',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}>
                                    Таны имэйл хаяг руу нууц үг сэргээх<br/>
                                    холбоос илгээх болно
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && <Notification key="error" message={error} type="error" />}
                            </AnimatePresence>

                            <div style={inputContainerStyle}>
                                <label htmlFor="email-input" style={{ 
                                    fontSize: '14px', 
                                    color: NAVY_COLOR, 
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px'
                                }}>
                                    <Email sx={{ fontSize: 18 }} /> Имэйл хаяг
                                </label>
                                <input
                                    id="email-input"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle}
                                    placeholder="example@email.com"
                                    onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(0, 123, 255, 0.2)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                                    }}
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                />
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
                                        Илгээж байна...
                                    </>
                                ) : (
                                    <>
                                        Сэргээх линк илгээх
                                        <ArrowBack sx={{ fontSize: 20, transform: 'rotate(180deg)' }} />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-content"
                            variants={successVariants}
                            initial="hidden"
                            animate="visible"
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 200,
                                    delay: 0.1 
                                }}
                            >
                                <CheckCircle 
                                    sx={{ 
                                        fontSize: 80, 
                                        color: SUCCESS_COLOR,
                                        mb: 2
                                    }}
                                    style={{ 
                                        filter: `drop-shadow(0 4px 15px ${SUCCESS_COLOR}50)`,
                                    }}
                                />
                            </motion.div>

                            <h2 style={{ 
                                color: NAVY_COLOR,
                                fontSize: '28px',
                                fontWeight: '800',
                                margin: '15px 0 15px 0',
                                letterSpacing: '-0.5px',
                            }}>
                                Амжилттай илгээлээ!
                            </h2>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    background: 'rgba(232, 245, 233, 0.95)',
                                    border: '2px solid rgba(76, 175, 80, 0.3)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '25px',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <p style={{ 
                                    color: '#2e7d32', 
                                    margin: 0, 
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    lineHeight: '1.6'
                                }}>
                                    {message}
                                </p>
                                <p style={{ 
                                    color: '#555', 
                                    fontSize: '14px', 
                                    marginTop: '12px',
                                    marginBottom: 0,
                                    lineHeight: '1.5'
                                }}>
                                    Имэйлээ шалгаж, сэргээх холбоос дээр дарна уу.
                                    <br/>
                                    <strong style={{ color: NAVY_COLOR }}>
                                        {email}
                                    </strong>
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ 
                                    fontSize: '13px', 
                                    color: '#666',
                                    background: 'rgba(255, 243, 224, 0.8)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 152, 0, 0.2)',
                                }}
                            >
                                 <strong>Зөвөлгөө:</strong> Хэрэв имэйл ирээгүй бол spam / junk 
                                фолдероо шалгана уу.
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ 
                    marginTop: '30px', 
                    textAlign: 'center',
                    paddingTop: '25px',
                    borderTop: '2px solid rgba(0, 0, 0, 0.06)'
                }}>
                    <motion.button
                        type="button"
                        onClick={onBackToLogin}
                        style={{
                            background: 'transparent',
                            border: `2px solid ${PRIMARY_BLUE}30`,
                            color: NAVY_COLOR,
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            margin: '0 auto',
                            transition: 'all 0.3s ease',
                            padding: '12px 24px',
                            borderRadius: '10px',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = PRIMARY_BLUE;
                            e.currentTarget.style.background = `${PRIMARY_BLUE}10`;
                            e.currentTarget.style.borderColor = PRIMARY_BLUE;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = NAVY_COLOR;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = `${PRIMARY_BLUE}30`;
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowBack sx={{ fontSize: 18 }} /> 
                        Нэвтрэх хуудас руу буцах
                    </motion.button>
                </div>
            </motion.form>
        </div>
    );
}