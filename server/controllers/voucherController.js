const db = require('../config/database');
const { saveBase64Signature } = require('../middleware/upload');

// Generate unique sequential voucher number (e.g., EV-2026-0001)
const generateVoucherNumber = () => {
    const year = new Date().getFullYear();
    const prefix = `EV-${year}-`;
    
    // Find the latest voucher number with this prefix
    const row = db.prepare(`
        SELECT voucher_number FROM vouchers 
        WHERE voucher_number LIKE ? 
        ORDER BY id DESC LIMIT 1
    `).get(`${prefix}%`);

    let nextNumber = 1;
    if (row && row.voucher_number) {
        const parts = row.voucher_number.split('-');
        if (parts.length === 3) {
            const lastNum = parseInt(parts[2], 10);
            if (!isNaN(lastNum)) {
                nextNumber = lastNum + 1;
            }
        }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Get all vouchers (filtered by role and query params)
 */
exports.getVouchers = (req, res) => {
    try {
        const user = req.user;
        const {
            search,
            voucher_number,
            employee_name,
            department,
            category,
            status,
            start_date,
            end_date,
            min_amount,
            max_amount,
            sort_by = 'created_at',
            sort_order = 'DESC',
            page = 1,
            limit = 50
        } = req.query;

        let query = `SELECT * FROM vouchers WHERE 1=1`;
        const params = [];

        // Role-based visibility
        if (user.role === 'employee') {
            query += ` AND employee_id = ?`;
            params.push(user.id);
        }
        // Director and Accounts can view all vouchers across organization

        // Specific filter: status
        if (status && status !== 'all') {
            query += ` AND status = ?`;
            params.push(status);
        }

        // Specific filter: department
        if (department && department !== 'all') {
            query += ` AND department = ?`;
            params.push(department);
        }

        // Specific filter: category
        if (category && category !== 'all') {
            query += ` AND expense_category = ?`;
            params.push(category);
        }

        // Specific filter: voucher_number
        if (voucher_number) {
            query += ` AND voucher_number LIKE ?`;
            params.push(`%${voucher_number.trim()}%`);
        }

        // Specific filter: employee_name
        if (employee_name) {
            query += ` AND employee_name LIKE ?`;
            params.push(`%${employee_name.trim()}%`);
        }

        // Generic search query (across voucher number, employee name, title, department)
        if (search) {
            query += ` AND (
                voucher_number LIKE ? OR 
                employee_name LIKE ? OR 
                expense_title LIKE ? OR 
                department LIKE ? OR 
                expense_category LIKE ?
            )`;
            const s = `%${search.trim()}%`;
            params.push(s, s, s, s, s);
        }

        // Date range filter (on expense_date)
        if (start_date) {
            query += ` AND expense_date >= ?`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND expense_date <= ?`;
            params.push(end_date);
        }

        // Amount range filter
        if (min_amount) {
            const min = parseFloat(min_amount);
            if (!isNaN(min)) {
                query += ` AND amount >= ?`;
                params.push(min);
            }
        }
        if (max_amount) {
            const max = parseFloat(max_amount);
            if (!isNaN(max)) {
                query += ` AND amount <= ?`;
                params.push(max);
            }
        }

        // Validate sort column to avoid SQL injection
        const allowedSortColumns = ['created_at', 'expense_date', 'voucher_date', 'amount', 'voucher_number', 'status', 'department'];
        const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
        const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Count total matching
        const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
        const countRow = db.prepare(countQuery).get(...params);
        const total = countRow ? countRow.total : 0;

        // Apply sorting and pagination
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        query += ` ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit, 10), offset);

        const rows = db.prepare(query).all(...params);

        return res.json({
            success: true,
            data: rows,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
            }
        });
    } catch (err) {
        console.error('getVouchers error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve vouchers', error: err.message });
    }
};

/**
 * Get single voucher by ID
 */
exports.getVoucherById = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        // Employee access check: employees can only view their own vouchers
        if (user.role === 'employee' && voucher.employee_id !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only view vouchers created by yourself.'
            });
        }

        return res.json({
            success: true,
            voucher
        });
    } catch (err) {
        console.error('getVoucherById error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve voucher', error: err.message });
    }
};

/**
 * Create a new voucher (Draft or direct Submit)
 */
exports.createVoucher = (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'employee') {
            return res.status(403).json({
                success: false,
                message: 'Only employees can create vouchers.'
            });
        }

        let {
            expense_date,
            department,
            expense_title,
            expense_category,
            expense_description,
            amount,
            status = 'Draft',
            employee_signature
        } = req.body;

        // If a file was uploaded via multipart/form-data
        if (req.file) {
            employee_signature = `/uploads/signatures/${req.file.filename}`;
        } else if (employee_signature && employee_signature.startsWith('data:image')) {
            employee_signature = saveBase64Signature(employee_signature);
        }

        // Mandatory validations
        if (!department || !department.trim()) {
            return res.status(400).json({ success: false, message: 'Department is mandatory.' });
        }
        if (!expense_title || !expense_title.trim()) {
            return res.status(400).json({ success: false, message: 'Expense title is mandatory.' });
        }
        if (!expense_date) {
            return res.status(400).json({ success: false, message: 'Expense date is mandatory.' });
        }
        if (amount === undefined || amount === null || amount === '') {
            return res.status(400).json({ success: false, message: 'Amount is mandatory.' });
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
        }

        // If submitting for approval immediately
        if (status === 'Pending Approval') {
            if (!employee_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee signature is mandatory before submission.'
                });
            }
        } else {
            status = 'Draft';
        }

        const voucherNumber = generateVoucherNumber();
        const voucherDate = new Date().toISOString().split('T')[0];

        const stmt = db.prepare(`
            INSERT INTO vouchers (
                voucher_number, voucher_date, expense_date, department,
                expense_title, expense_category, expense_description, amount,
                employee_id, employee_name, employee_code, employee_signature,
                status, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `);

        const result = stmt.run(
            voucherNumber,
            voucherDate,
            expense_date,
            department.trim(),
            expense_title.trim(),
            expense_category || 'Miscellaneous',
            expense_description ? expense_description.trim() : '',
            numAmount,
            user.id,
            user.name,
            user.employee_code || null,
            employee_signature || null,
            status
        );

        const newVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(result.lastInsertRowid);

        return res.status(201).json({
            success: true,
            message: status === 'Pending Approval' ? 'Voucher submitted successfully for approval' : 'Voucher draft created successfully',
            voucher: newVoucher
        });
    } catch (err) {
        console.error('createVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create voucher', error: err.message });
    }
};

/**
 * Update an existing voucher (ONLY in Draft status by creator)
 */
exports.updateVoucher = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        if (user.role !== 'employee') {
            return res.status(403).json({ success: false, message: 'Only employees can edit vouchers.' });
        }

        if (voucher.employee_id !== user.id) {
            return res.status(403).json({ success: false, message: 'You can only edit your own vouchers.' });
        }

        // Business Rule: Employees may edit vouchers only while they are in Draft status.
        if (voucher.status !== 'Draft') {
            return res.status(400).json({
                success: false,
                message: `Cannot edit voucher. Only vouchers in 'Draft' status can be modified. Current status: ${voucher.status}`
            });
        }

        let {
            expense_date,
            department,
            expense_title,
            expense_category,
            expense_description,
            amount,
            employee_signature,
            submit_now
        } = req.body;

        if (req.file) {
            employee_signature = `/uploads/signatures/${req.file.filename}`;
        } else if (employee_signature && employee_signature.startsWith('data:image')) {
            employee_signature = saveBase64Signature(employee_signature);
        }

        const effectiveDepartment = department !== undefined ? department.trim() : voucher.department;
        const effectiveTitle = expense_title !== undefined ? expense_title.trim() : voucher.expense_title;
        const effectiveDate = expense_date !== undefined ? expense_date : voucher.expense_date;
        const effectiveCategory = expense_category !== undefined ? expense_category : voucher.expense_category;
        const effectiveDesc = expense_description !== undefined ? expense_description.trim() : voucher.expense_description;
        const effectiveSig = employee_signature !== undefined ? employee_signature : voucher.employee_signature;

        let effectiveAmount = voucher.amount;
        if (amount !== undefined) {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
            }
            effectiveAmount = numAmount;
        }

        if (!effectiveDepartment) {
            return res.status(400).json({ success: false, message: 'Department is mandatory.' });
        }
        if (!effectiveTitle) {
            return res.status(400).json({ success: false, message: 'Expense title is mandatory.' });
        }
        if (!effectiveDate) {
            return res.status(400).json({ success: false, message: 'Expense date is mandatory.' });
        }

        let newStatus = voucher.status;
        if (submit_now === true || submit_now === 'true') {
            if (!effectiveSig) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee signature is mandatory before submission.'
                });
            }
            newStatus = 'Pending Approval';
        }

        db.prepare(`
            UPDATE vouchers SET
                expense_date = ?,
                department = ?,
                expense_title = ?,
                expense_category = ?,
                expense_description = ?,
                amount = ?,
                employee_signature = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            effectiveDate,
            effectiveDepartment,
            effectiveTitle,
            effectiveCategory,
            effectiveDesc,
            effectiveAmount,
            effectiveSig,
            newStatus,
            id
        );

        const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        return res.json({
            success: true,
            message: newStatus === 'Pending Approval' ? 'Voucher submitted for approval' : 'Draft updated successfully',
            voucher: updated
        });
    } catch (err) {
        console.error('updateVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update voucher', error: err.message });
    }
};

/**
 * Submit a Draft voucher for approval
 */
exports.submitVoucher = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        if (user.role !== 'employee' || voucher.employee_id !== user.id) {
            return res.status(403).json({ success: false, message: 'You can only submit your own vouchers.' });
        }

        if (voucher.status !== 'Draft') {
            return res.status(400).json({
                success: false,
                message: `Only Draft vouchers can be submitted. Current status: ${voucher.status}`
            });
        }

        let signature = voucher.employee_signature;
        if (req.file) {
            signature = `/uploads/signatures/${req.file.filename}`;
        } else if (req.body.signature && req.body.signature.startsWith('data:image')) {
            signature = saveBase64Signature(req.body.signature);
        } else if (req.body.signature) {
            signature = req.body.signature;
        }

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: 'Employee signature is mandatory before submission.'
            });
        }

        db.prepare(`
            UPDATE vouchers SET
                employee_signature = ?,
                status = 'Pending Approval',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(signature, id);

        const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        return res.json({
            success: true,
            message: 'Voucher submitted successfully for Director approval',
            voucher: updated
        });
    } catch (err) {
        console.error('submitVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to submit voucher', error: err.message });
    }
};

/**
 * Delete a Draft voucher (ONLY Draft status by creator)
 */
exports.deleteVoucher = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        if (user.role !== 'employee' || voucher.employee_id !== user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own draft vouchers.' });
        }

        if (voucher.status !== 'Draft') {
            return res.status(400).json({
                success: false,
                message: `Employees may delete vouchers only while they are in Draft status. Current status: ${voucher.status}`
            });
        }

        db.prepare('DELETE FROM vouchers WHERE id = ?').run(id);

        return res.json({
            success: true,
            message: 'Draft voucher deleted successfully'
        });
    } catch (err) {
        console.error('deleteVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete voucher', error: err.message });
    }
};

/**
 * Approve a voucher (Director only, requires director signature)
 */
exports.approveVoucher = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 'director') {
            return res.status(403).json({ success: false, message: 'Only the Director can approve vouchers.' });
        }

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        if (voucher.status !== 'Pending Approval') {
            return res.status(400).json({
                success: false,
                message: `Only vouchers with 'Pending Approval' status can be approved. Current status: ${voucher.status}`
            });
        }

        let directorSignature = null;
        if (req.file) {
            directorSignature = `/uploads/signatures/${req.file.filename}`;
        } else if (req.body.director_signature && req.body.director_signature.startsWith('data:image')) {
            directorSignature = saveBase64Signature(req.body.director_signature);
        } else if (req.body.director_signature) {
            directorSignature = req.body.director_signature;
        }

        // Validation Rule: Director Signature is mandatory before approval
        if (!directorSignature) {
            return res.status(400).json({
                success: false,
                message: 'Director Signature is mandatory before approval.'
            });
        }

        db.prepare(`
            UPDATE vouchers SET
                status = 'Approved',
                director_id = ?,
                director_name = ?,
                director_signature = ?,
                approval_date = CURRENT_TIMESTAMP,
                rejection_reason = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(user.id, user.name, directorSignature, id);

        const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        return res.json({
            success: true,
            message: 'Voucher successfully approved',
            voucher: updated
        });
    } catch (err) {
        console.error('approveVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to approve voucher', error: err.message });
    }
};

/**
 * Reject a voucher (Director only, requires rejection reason)
 */
exports.rejectVoucher = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 'director') {
            return res.status(403).json({ success: false, message: 'Only the Director can reject vouchers.' });
        }

        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        if (voucher.status !== 'Pending Approval') {
            return res.status(400).json({
                success: false,
                message: `Only vouchers with 'Pending Approval' status can be rejected. Current status: ${voucher.status}`
            });
        }

        const { rejection_reason } = req.body;

        // Validation Rule: Rejection Reason is mandatory if a voucher is rejected
        if (!rejection_reason || !rejection_reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Rejection Reason is mandatory when rejecting a voucher.'
            });
        }

        db.prepare(`
            UPDATE vouchers SET
                status = 'Rejected',
                director_id = ?,
                director_name = ?,
                rejection_reason = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(user.id, user.name, rejection_reason.trim(), id);

        const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

        return res.json({
            success: true,
            message: 'Voucher rejected with reason provided',
            voucher: updated
        });
    } catch (err) {
        console.error('rejectVoucher error:', err);
        return res.status(500).json({ success: false, message: 'Failed to reject voucher', error: err.message });
    }
};
