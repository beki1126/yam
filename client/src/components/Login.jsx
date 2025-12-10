import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    ArrowForward, 
    VpnKey, 
    Refresh, 
    Visibility, 
    VisibilityOff,
    CheckCircle,
    Error as ErrorIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import backgroundImage from '../images/background.png'; // Зургийн замыг засах

// Өнгөний тогтмолууд - Background-тай тааруулсан
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

const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
};

// Glassmorphism эффекттэй form загвар
const formStyleBase = {
    background: 'rgba(255, 255, 255, 0.95)', // Бага зэрэг тунгалаг
    backdropFilter: 'blur(20px)', // Blur эффект
    WebkitBackdropFilter: 'blur(20px)', // Safari-д зориулсан
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

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
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

const buttonStyleBase = {
    width: '100%',
    padding: '15px',
    background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${ACCENT_COLOR})`,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    boxShadow: `0 8px 25px ${PRIMARY_BLUE}40`,
};

export default function Login({ onLogin, onReset }) { 
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [err, setErr] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempToken, setTempToken] = useState(null);
    
    const otpRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);
        
        const lastFilledIndex = pastedData.length - 1;
        if (lastFilledIndex >= 0 && lastFilledIndex < 6) {
            otpRefs.current[lastFilledIndex]?.focus();
        }
    };

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (err) {
            const timer = setTimeout(() => setErr(''), 8000);
            return () => clearTimeout(timer);
        }
    }, [err]);

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

    const getButtonStyle = (isLoading) => ({
        ...buttonStyleBase,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.8 : 1,
        transform: isLoading ? 'scale(0.98)' : 'scale(1)',
    });

    const handleMouseOver = (e, isLoading) => {
        if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 12px 30px ${PRIMARY_BLUE}50`;
        }
    };

    const handleMouseOut = (e, isLoading) => {
        if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 8px 25px ${PRIMARY_BLUE}40`;
        }
    };

    async function handleLogin(e) {
        e.preventDefault();
        setErr('');
        setSuccessMsg('');
        
        if (!email || !pass) {
            setErr('Имэйл болон нууц үгээ оруулна уу.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/login', { 
                email, 
                password: pass 
            });

            if (response.data.pending_2fa) {
                setTempToken(response.data.tempToken || null); 
                setStep(2);
                setSuccessMsg('Баталгаажуулах кодыг таны имэйл хаяг руу илгээлээ.');
            } else if (response.data.token) {
                onLogin(response.data.token);
            } else {
                setErr('Нэвтрэх үйл явц амжилтгүй боллоо. Дахин оролдоно уу.');
            }

        } catch (e) {
            console.error('Login error:', e);
            const errorMessage = e.response?.data?.message || 
                                 'Нэвтрэх амжилтгүй. Имэйл эсвэл нууц үг буруу байна.';
            setErr(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(e) {
        e.preventDefault();
        setErr('');
        setSuccessMsg('');

        const otpCode = otp.join('');
        
        if (otpCode.length < 6) {
            setErr('6 оронтой кодыг бүрэн оруулна уу.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp_code: otpCode,
                temp_token: tempToken
            });

            if (response.data.token) {
                setSuccessMsg('Амжилттай баталгаажлаа!');
                setTimeout(() => onLogin(response.data.token), 1000);
            } else {
                setErr(response.data.message || 'Баталгаажуулах код буруу эсвэл хугацаа нь дууссан.');
            }

        } catch (e) {
            console.error('OTP verification error:', e);
            const errorMessage = e.response?.data?.message || 'Баталгаажуулах үйл явц алдаатай.';
            setErr(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    
    async function resendOtp() {
        setErr('');
        setSuccessMsg('');
        
        try {
            await api.post('/auth/resend-otp', { email });
            setSuccessMsg('Баталгаажуулах кодыг амжилттай дахин илгээлээ.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } catch (e) {
            console.error('Resend OTP error:', e);
            setErr('Код дахин илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
        }
    }

    const renderLoginForm = () => (
        <motion.div
            key="login-form"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
        >
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
                >
                    <Shield 
                        sx={{ fontSize: 65, color: PRIMARY_BLUE, mb: 1.5 }}
                        style={{ 
                            filter: `drop-shadow(0 4px 15px ${PRIMARY_BLUE}60)`,
                        }}
                    />
                </motion.div>
                <h2 style={{ 
                    color: NAVY_COLOR,
                    fontSize: '32px',
                    fontWeight: '800',
                    margin: '10px 0 8px 0',
                    letterSpacing: '-0.5px',
                }}>
                    Нэвтрэх
                </h2>
                <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#555',
                    lineHeight: '1.6',
                    maxWidth: '350px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    fontWeight: '500',
                }}>
                    Мэдээллийн Аюулгүй Байдлын Аудит Хийх<br/>
                    Эрх Бүхий Хуулийн Этгээдийн Бүртгэл
                </p>
            </div>

            <AnimatePresence mode="wait">
                {err && <Notification key="error" message={err} type="error" />}
                {successMsg && <Notification key="success" message={successMsg} type="success" />}
            </AnimatePresence>

            <div style={inputContainerStyle}>
                <label htmlFor="email-input" style={{ 
                    fontSize: '14px', 
                    color: NAVY_COLOR, 
                    fontWeight: '600',
                    marginBottom: '4px',
                }}>
                    Имэйл хаяг
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

            <div style={inputContainerStyle}>
                <label htmlFor="password-input" style={{ 
                    fontSize: '14px', 
                    color: NAVY_COLOR, 
                    fontWeight: '600',
                    marginBottom: '4px',
                }}>
                    Нууц үг
                </label>
                <div style={inputWrapperStyle}>
                    <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        style={{...inputStyle, paddingRight: '45px'}}
                        placeholder="••••••••"
                        onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 123, 255, 0.2)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        }}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#666',
                            transition: 'color 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = PRIMARY_BLUE}
                        onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                        disabled={loading}
                        aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                    >
                        {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 22 }} />
                        ) : (
                            <Visibility sx={{ fontSize: 22 }} />
                        )}
                    </button>
                </div>
            </div>

            <motion.button 
                type="submit" 
                style={getButtonStyle(loading)}
                disabled={loading}
                onMouseOver={(e) => handleMouseOver(e, loading)}
                onMouseOut={(e) => handleMouseOut(e, loading)}
                whileTap={{ scale: loading ? 1 : 0.97 }}
            >
                {loading ? (
                    <>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        Нэвтэрч байна...
                    </>
                ) : (
                    <>
                        Нэвтрэх 
                        <ArrowForward sx={{ fontSize: 20 }} />
                    </>
                )}
            </motion.button>

            <div style={{ 
                marginTop: '25px', 
                textAlign: 'center', 
                fontSize: '14px',
            }}>
                <span
                    style={{ 
                        cursor: 'pointer', 
                        color: PRIMARY_BLUE, 
                        fontWeight: '600', 
                        textDecoration: 'none', 
                        transition: 'all 0.2s',
                    }}
                    onClick={onReset}
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onReset()}
                >
                    Нууц үгээ мартсан уу?
                </span>
            </div>
        </motion.div>
    );

    const renderOtpForm = () => (
        <motion.div
            key="otp-form"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
        >
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 150 }}
                >
                    <VpnKey 
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
                    Баталгаажуулах
                </h2>
                <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#555',
                    lineHeight: '1.6',
                    fontWeight: '500',
                }}>
                    <strong style={{ color: NAVY_COLOR }}>{email}</strong> хаяг руу илгээсэн<br/>
                    6 оронтой кодыг оруулна уу
                </p>
            </div>

            <AnimatePresence mode="wait">
                {err && <Notification key="error" message={err} type="error" />}
                {successMsg && <Notification key="success" message={successMsg} type="success" />}
            </AnimatePresence>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                    fontSize: '14px', 
                    color: NAVY_COLOR, 
                    fontWeight: '600',
                    marginBottom: '12px',
                    display: 'block',
                    textAlign: 'center',
                }}>
                    Баталгаажуулах код
                </label>
                <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'center',
                }}>
                    {otp.map((digit, index) => (
                        <motion.input
                            key={index}
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            style={{
                                width: '52px',
                                height: '64px',
                                textAlign: 'center',
                                fontSize: '26px',
                                fontWeight: 'bold',
                                border: '2px solid rgba(0, 123, 255, 0.2)',
                                borderRadius: '14px',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                backgroundColor: digit ? 'rgba(240, 248, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = PRIMARY_BLUE;
                                e.target.style.boxShadow = `0 0 0 4px ${PRIMARY_BLUE}15`;
                                e.target.style.backgroundColor = 'rgba(240, 248, 255, 0.95)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(0, 123, 255, 0.2)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = digit ? 'rgba(240, 248, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)';
                            }}
                            disabled={loading}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        />
                    ))}
                </div>
            </div>

            <motion.button 
                type="submit" 
                style={getButtonStyle(loading)}
                disabled={loading}
                onMouseOver={(e) => handleMouseOver(e, loading)}
                onMouseOut={(e) => handleMouseOut(e, loading)}
                whileTap={{ scale: loading ? 1 : 0.97 }}
            >
                {loading ? (
                    <>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        Шалгаж байна...
                    </>
                ) : (
                    <>
                        Баталгаажуулах
                        <ArrowForward sx={{ fontSize: 20 }} />
                    </>
                )}
            </motion.button>
            
            <div style={{ 
                marginTop: '25px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                gap: '15px',
            }}>
                <span
                    style={{ 
                        cursor: 'pointer', 
                        color: '#666', 
                        fontWeight: '600', 
                        transition: 'color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                    onClick={() => {
                        setStep(1);
                        setErr('');
                        setSuccessMsg('');
                        setOtp(['', '', '', '', '', '']);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = PRIMARY_BLUE}
                    onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                    role="button"
                    tabIndex={0}
                >
                    ← Буцах
                </span>
                <span
                    style={{ 
                        cursor: 'pointer', 
                        color: PRIMARY_BLUE, 
                        fontWeight: '600', 
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                    }}
                    onClick={resendOtp}
                    onMouseOver={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                    }}
                    role="button"
                    tabIndex={0}
                >
                    Дахин илгээх <Refresh sx={{ fontSize: 16 }} />
                </span>
            </div>
        </motion.div>
    );

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
            {/* Overlay - Зургийг бага зэрэг бараахан болгох */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.15)', // Бага зэрэг харанхуй
                backdropFilter: 'blur(2px)', // Маш бага blur
            }} />

            <motion.form
                onSubmit={step === 1 ? handleLogin : handleVerifyOtp}
                style={formStyleBase}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={formVariants}
            >
                <div style={topBar}></div>
                
                <AnimatePresence mode="wait">
                    {step === 1 && renderLoginForm()}
                    {step === 2 && renderOtpForm()}
                </AnimatePresence>
            </motion.form>
        </div>
    );
}