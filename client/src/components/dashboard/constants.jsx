// ============================================
// CONSTANTS.JS - Нийтлэг тогтмолууд
// ============================================

import React from "react";
import { Policy, Code, Security, Gavel } from "@mui/icons-material";

// Global Theme Colors
export const PRIMARY_BLUE = "#007BFF"; 
export const NAVY_COLOR = "#053B50";

// Тусгай зөвшөөрлийн төрлүүд 
export const LICENSE_TYPES = [
    { 
        key: "All", 
        label: "Бүх Зөвшөөрөл", 
        icon: <Policy />, 
        color: "default" 
    },
    { 
        key: "digital_signature", 
        label: "Тоон гарын үсгийн гэрчилгээ олгох үйл ажиллагаа эрхлэх тусгай зөвшөөрөл", 
        icon: <Code />, 
        color: "info" 
    },
    { 
        key: "security_audit", 
        label: "Мэдээллийн аюулгүй байдлын аудит хийх зөвшөөрөл", 
        icon: <Security />, 
        color: "primary" 
    },
    { 
        key: "cyber_risk", 
        label: "Кибер аюулгүй байдлын эрсдэлийн үнэлгээ хийх зөвшөөрөл", 
        icon: <Gavel />, 
        color: "secondary" 
    },
];

export const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 48 * 3.5 + 8,
            width: 200,            
        },
    },
};

// Display columns for table
export const DISPLAY_COLUMNS = [
    { key: "id", label: "#", width: "40px" },
    { key: "org_name", label: "Байгууллага", width: "220px" },
    { key: "registration_number", label: "Регистр", width: "110px" },
    { key: "license_expire_date", label: "Зөвш. Дуусах", width: "100px" }, 
];

// Form labels
export const FORM_LABELS = {
    // Frontend form fields
    org_name: "Байгууллагын нэр",
    registration_number: "Хуулийн этгээдийн регистр",
    license_expire_date: "Зөвшөөрөл дуусах хугацаа",
    license_numbers: "Тушаалын огноо, дугаар",
    certificates: "Сертификат",
    cert_expire_date: "Сертификатын хугацаа",
    contact_person: "Сертификат эзэмшигч",
    contact_phone: "Холбоо барих",
    email: "Цахим шуудан",
    address: "Хаяг/Байршил",
    reporting_org: "Нэмэлт тайлбар",
    attachment_filename: "Хавсаргасан файлын URL", 
    license_type: "Зөвшөөрлийн төрөл",
    
    // Backend fields (if they leak into form)
    type: "Зөвшөөрлийн төрөл",
    cert_owner: "Сертификат эзэмшигч",
    certificate_number: "Сертификат дугаар",
    certificate_status: "Сертификатын статус",
    created_at: "Үүсгэсэн огноо",
    updated_at: "Шинэчилсэн огноо",
};

// Initial form state
export const INITIAL_FORM_STATE = {
    org_name: "", 
    registration_number: "",
    license_expire_date: "", 
    license_numbers: "",
    certificates: "",
    cert_expire_date: "", 
    contact_person: "",
    contact_phone: "",
    email: "",
    address: "",
    reporting_org: "",
    attachment_filename: "", 
    license_type: [], 
};