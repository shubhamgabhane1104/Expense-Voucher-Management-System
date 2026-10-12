const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_expense_voucher_2026_xyz';

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const stmt = db.prepare('SELECT id, name, email, role, employee_code, department, signature_url FROM users WHERE id = ?');
        const user = stmt.get(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or session invalid.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    requireRole,
    JWT_SECRET
};
