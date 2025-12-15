import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { notification } from 'antd';  // 🔵 Ant Design notification
import 'antd/dist/reset.css';        // Reset style for v5

import Login from './components/Login';
import DashboardPage from './components/DashboardPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const SKIP_AUTO_LOGIN = false;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 минут

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(145deg, #053B50 0%, #007BFF 100%)',
      color: '#fff',
      fontSize: '18px'
    }}>
      Ачааллаж байна...
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const showIdleLogoutNotification = () => {
    notification.warning({
      message: "Автоматаар гарлаа",
      description: "Та 5 минут идэвхгүй байсан тул дахин нэвтэрнэ үү.",
      placement: "topRight",
      duration: 4,
      style: {
        border: "1px solid #ff4d4f",
        borderRadius: 10,
        padding: 12,
        background: "#fff1f0",
      }
    });
  };

  // Таймер reset
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
        showIdleLogoutNotification();
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Хэрэглэгчийн үйлдлийг сонсох
  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    resetInactivityTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [token]);

  // LocalStorage token шалгах
  useEffect(() => {
    if (SKIP_AUTO_LOGIN) {
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);

    setLoading(false);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);

    navigate('/login');
  };

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* ✅ ӨӨРЧЛӨЛТ: Шууд dashboard руу чиглүүлэх */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route 
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> :
          <Login onLogin={handleLogin} onReset={() => navigate('/forgot-password')} />
        }
      />

      <Route 
        path="/forgot-password"
        element={
          token ? <Navigate to="/dashboard" replace /> :
          <ForgotPassword onBackToLogin={() => navigate('/login')} />
        }
      />

      <Route path="/reset-password-confirm/:token" element={<ResetPassword />} />

      <Route 
        path="/dashboard"
        element={
          token ? 
            <DashboardPage token={token} onLogout={handleLogout} /> :
            <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
