require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure database and uploads directory exist
require('./config/database');
const uploadDir = path.join(__dirname, 'uploads', 'signatures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Expense Voucher Management API',
        timestamp: new Date().toISOString()
    });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.url} not found`
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Expense Voucher API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});

module.exports = { app, server };
