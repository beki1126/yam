// ============================================
// METRICCARD.JSX - Statistics Card Component
// ============================================

import React from "react";
import { Paper, Typography, Box, Avatar } from "@mui/material";
import { motion } from "framer-motion";

export default function MetricCard({ title, value, icon, color }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.3 }}
        >
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    borderLeft: `4px solid ${color}` 
                }}
            >
                <Box>
                    <Typography 
                        variant="caption" 
                        color="textSecondary" 
                        gutterBottom 
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    >
                        {title}
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ fontWeight: 700, color, lineHeight: 1.2 }}
                    >
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 24 } })}
                </Avatar>
            </Paper>
        </motion.div>
    );
}