// ============================================
// UTILS.JS - Туслах функцүүд
// ============================================

import moment from "moment";
import { notification } from 'antd';

// ✅ Notification helper function
export const showNotification = (type, message, description = '') => {
    notification[type]({
        message,
        description,
        placement: 'topRight',
        duration: 3,
        style: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
    });
};

// Capitalize string
export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

// Convert license type to array
export const convertLicenseTypeToArray = (licenseTypeString) => {
    if (!licenseTypeString) return [];
    if (Array.isArray(licenseTypeString)) return licenseTypeString;
    
    return licenseTypeString.split(',')
                           .map(s => s.trim())
                           .filter(s => s);
};

// Format date for input
export const formatDateForInput = (date) => 
    date && moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : '';

// ✅ СОРТЛОХ ФУНКЦ
export const sortRows = (rows) => {
    const now = moment();
    
    return [...rows].sort((a, b) => {
        const aExp = moment(a.license_expire_date).diff(now, "days");
        const bExp = moment(b.license_expire_date).diff(now, "days");
        
        const isAExpired = aExp < 0;
        const isBExpired = bExp < 0;
        
        if (isAExpired && !isBExpired) return -1;
        if (!isAExpired && isBExpired) return 1;
        
        if (isAExpired && isBExpired) {
            return aExp - bExp;
        }
        
        const isAWarning = aExp >= 0 && aExp <= 30;
        const isBWarning = bExp >= 0 && bExp <= 30;
        
        if (isAWarning && !isBWarning) return -1;
        if (!isAWarning && isBWarning) return 1;
        
        if (isAWarning && isBWarning) {
            return aExp - bExp;
        }
        
        return b.id - a.id;
    });
};