const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { saveBase64Signature } = require('../middleware/upload');

exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
        const user = stmt.get(email.trim());

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            employee_code: user.employee_code,
            department: user.department,
            signature_url: user.signature_url
        };

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: safeUser
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: err.message
        });
    }
};

exports.getCurrentUser = (req, res) => {
    return res.json({
        success: true,
        user: req.user
    });
};

exports.uploadSignature = (req, res) => {
    try {
        let signatureUrl = null;
        if (req.file) {
            signatureUrl = `/uploads/signatures/${req.file.filename}`;
        } else if (req.body.signatureData) {
            signatureUrl = saveBase64Signature(req.body.signatureData);
        }

        if (!signatureUrl) {
            return res.status(400).json({
                success: false,
                message: 'No signature image provided.'
            });
        }

        // Save as default signature for this user
        db.prepare('UPDATE users SET signature_url = ? WHERE id = ?').run(signatureUrl, req.user.id);

        return res.json({
            success: true,
            message: 'Signature saved successfully',
            signatureUrl
        });
    } catch (err) {
        console.error('Signature upload error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload signature',
            error: err.message
        });
    }
};
