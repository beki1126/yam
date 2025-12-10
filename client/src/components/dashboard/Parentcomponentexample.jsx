// ============================================
// PARENT COMPONENT - UPDATED with Error Handling
// ============================================

import React, { useState } from "react";
import AddEditModal from "./AddEditModal_updated";
import { Button, Snackbar, Alert } from "@mui/material";

export default function ParentComponent() {
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        org_name: "",
        registration_number: "",
        address: "",
        license_type: [],
        license_numbers: "",
        license_expire_date: "",
        certificates: "",
        cert_expire_date: "",
        contact_person: "",
        contact_phone: "",
        email: "",
        reporting_org: ""
    });
    
    // 🆕 Success notification state
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // ✅ onChange handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 🆕 Save handler - ASYNC with Error Handling
    const handleSave = async (updatedForm) => {
        try {
            // API endpoint
            const endpoint = isEdit 
                ? `/api/organizations/${updatedForm.id}` 
                : '/api/organizations';
            
            const method = isEdit ? 'PUT' : 'POST';
            
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            
            // API call
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedForm)
            });
            
            const data = await response.json();
            
            // Check if request failed
            if (!data.success) {
                // Return error to modal
                return { 
                    error: true, 
                    message: data.message || 'Алдаа гарлаа' 
                };
            }
            
            // ✅ Success!
            setSuccessMessage(
                isEdit 
                    ? 'Байгууллага амжилттай шинэчлэгдлээ!' 
                    : 'Байгууллага амжилттай нэмэгдлээ!'
            );
            setSuccessOpen(true);
            
            // Close modal
            setModalOpen(false);
            
            // 🔄 Refresh data list (parent component-ын function дуудах)
            // refreshOrganizations();
            
            // Return success
            return { error: false };
            
        } catch (error) {
            console.error('Save error:', error);
            
            // Return error to modal
            return { 
                error: true, 
                message: 'Сервертэй холбогдоход алдаа гарлаа. Дахин оролдоно уу.' 
            };
        }
    };

    // Open modal for new entry
    const handleOpenAdd = () => {
        setForm({
            org_name: "",
            registration_number: "",
            address: "",
            license_type: [],
            license_numbers: "",
            license_expire_date: "",
            certificates: "",
            cert_expire_date: "",
            contact_person: "",
            contact_phone: "",
            email: "",
            reporting_org: ""
        });
        setIsEdit(false);
        setModalOpen(true);
    };

    // Open modal for editing
    const handleOpenEdit = (existingData) => {
        setForm(existingData);
        setIsEdit(true);
        setModalOpen(true);
    };

    return (
        <div>
            <Button onClick={handleOpenAdd}>
                Шинэ байгууллага нэмэх
            </Button>

            <AddEditModal
                open={modalOpen}
                isEdit={isEdit}
                form={form}
                onChange={handleChange}
                onSave={handleSave}  // ✅ ASYNC function
                onClose={() => setModalOpen(false)}
            />
            
            {/* 🆕 Success Notification */}
            <Snackbar
                open={successOpen}
                autoHideDuration={4000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSuccessOpen(false)} 
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}