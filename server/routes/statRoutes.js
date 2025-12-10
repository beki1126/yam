// server/routes/statRoutes.js
const express = require('express');
const router = express.Router();
const statController = require('../controllers/statController');

/**
 * Dashboard статистик мэдээлэл авах
 * GET /api/stats/dashboard
 */
router.get('/dashboard', statController.getDashboardStats);

module.exports = router;