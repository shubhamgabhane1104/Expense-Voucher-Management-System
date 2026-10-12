const db = require('../config/database');

/**
 * Get dashboard statistics according to user role
 */
exports.getDashboardStats = (req, res) => {
    try {
        const user = req.user;
        const todayDate = new Date().toISOString().split('T')[0];

        if (user.role === 'employee') {
            // Employee metrics: only vouchers created by themselves
            const counts = db.prepare(`
                SELECT 
                    COUNT(*) as total_vouchers,
                    SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_vouchers,
                    SUM(CASE WHEN status = 'Pending Approval' THEN 1 ELSE 0 END) as pending_approval,
                    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_vouchers,
                    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_vouchers,
                    COALESCE(SUM(amount), 0) as total_amount_claimed,
                    COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as total_approved_amount
                FROM vouchers
                WHERE employee_id = ?
            `).get(user.id);

            const recentVouchers = db.prepare(`
                SELECT * FROM vouchers 
                WHERE employee_id = ? 
                ORDER BY created_at DESC 
                LIMIT 5
            `).all(user.id);

            return res.json({
                success: true,
                role: 'employee',
                stats: {
                    totalVouchers: counts.total_vouchers || 0,
                    draftVouchers: counts.draft_vouchers || 0,
                    pendingApproval: counts.pending_approval || 0,
                    approvedVouchers: counts.approved_vouchers || 0,
                    rejectedVouchers: counts.rejected_vouchers || 0,
                    totalAmountClaimed: counts.total_amount_claimed || 0,
                    totalApprovedAmount: counts.total_approved_amount || 0
                },
                recentVouchers
            });

        } else if (user.role === 'director') {
            // Director metrics: organization-wide pending count, approved today, rejected today, total pending amount, recent activity
            const stats = db.prepare(`
                SELECT 
                    COUNT(*) as total_vouchers,
                    SUM(CASE WHEN status = 'Pending Approval' THEN 1 ELSE 0 END) as pending_approval_count,
                    COALESCE(SUM(CASE WHEN status = 'Pending Approval' THEN amount ELSE 0 END), 0) as total_pending_amount,
                    SUM(CASE WHEN status = 'Approved' AND date(approval_date) = date(?) THEN 1 ELSE 0 END) as approved_today,
                    SUM(CASE WHEN status = 'Rejected' AND date(updated_at) = date(?) THEN 1 ELSE 0 END) as rejected_today,
                    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as total_approved_count,
                    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as total_rejected_count
                FROM vouchers
            `).get(todayDate, todayDate);

            const pendingVouchers = db.prepare(`
                SELECT * FROM vouchers 
                WHERE status = 'Pending Approval' 
                ORDER BY created_at ASC 
                LIMIT 6
            `).all();

            const recentActivity = db.prepare(`
                SELECT * FROM vouchers 
                ORDER BY updated_at DESC 
                LIMIT 8
            `).all();

            return res.json({
                success: true,
                role: 'director',
                stats: {
                    totalVouchers: stats.total_vouchers || 0,
                    pendingApprovalCount: stats.pending_approval_count || 0,
                    totalPendingAmount: stats.total_pending_amount || 0,
                    approvedToday: stats.approved_today || 0,
                    rejectedToday: stats.rejected_today || 0,
                    totalApprovedCount: stats.total_approved_count || 0,
                    totalRejectedCount: stats.total_rejected_count || 0
                },
                pendingVouchers,
                recentActivity
            });

        } else if (user.role === 'accounts') {
            // Accounts metrics: total vouchers, pending approval, approved vouchers, rejected vouchers, total approved expense amount, recent approved vouchers
            const stats = db.prepare(`
                SELECT 
                    COUNT(*) as total_vouchers,
                    SUM(CASE WHEN status = 'Pending Approval' THEN 1 ELSE 0 END) as pending_approval,
                    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_vouchers,
                    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_vouchers,
                    COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as total_approved_expense_amount,
                    COALESCE(SUM(amount), 0) as total_organization_amount
                FROM vouchers
            `).get();

            const recentApprovedVouchers = db.prepare(`
                SELECT * FROM vouchers 
                WHERE status = 'Approved' 
                ORDER BY approval_date DESC 
                LIMIT 6
            `).all();

            // Department-wise expense distribution for financial insights
            const departmentBreakdown = db.prepare(`
                SELECT department, COUNT(*) as count, SUM(amount) as total_amount
                FROM vouchers
                WHERE status = 'Approved'
                GROUP BY department
                ORDER BY total_amount DESC
            `).all();

            return res.json({
                success: true,
                role: 'accounts',
                stats: {
                    totalVouchers: stats.total_vouchers || 0,
                    pendingApproval: stats.pending_approval || 0,
                    approvedVouchers: stats.approved_vouchers || 0,
                    rejectedVouchers: stats.rejected_vouchers || 0,
                    totalApprovedExpenseAmount: stats.total_approved_expense_amount || 0,
                    totalOrganizationAmount: stats.total_organization_amount || 0
                },
                recentApprovedVouchers,
                departmentBreakdown
            });
        }

        return res.status(400).json({ success: false, message: 'Invalid role' });
    } catch (err) {
        console.error('getDashboardStats error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats', error: err.message });
    }
};
