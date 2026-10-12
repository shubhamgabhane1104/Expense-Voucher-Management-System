import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, approveVoucherApi, rejectVoucherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoucherStatusBadge from '../components/VoucherStatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    IndianRupee, 
    FileText, 
    Eye, 
    Check, 
    X, 
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DirectorDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [approveModal, setApproveModal] = useState({ isOpen: false, voucher: null });
    const [rejectModal, setRejectModal] = useState({ isOpen: false, voucher: null });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await getDashboardStatsApi();
            setData(res);
        } catch (err) {
            setError(err.message || 'Failed to load director dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amt || 0);
    };

    // Approval flow
    const handleApproveClick = (voucher) => {
        setApproveModal({ isOpen: true, voucher });
    };

    const handleConfirmApprove = async ({ signature }) => {
        if (!approveModal.voucher) return;
        setIsActionLoading(true);
        try {
            await approveVoucherApi(approveModal.voucher.id, signature);
            setApproveModal({ isOpen: false, voucher: null });
            
            // Trigger celebration confetti
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch {}

            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to approve voucher');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Rejection flow
    const handleRejectClick = (voucher) => {
        setRejectModal({ isOpen: true, voucher });
    };

    const handleConfirmReject = async ({ rejectionReason }) => {
        if (!rejectModal.voucher) return;
        setIsActionLoading(true);
        try {
            await rejectVoucherApi(rejectModal.voucher.id, rejectionReason);
            setRejectModal({ isOpen: false, voucher: null });
            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to reject voucher');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading director dashboard...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const pendingVouchers = data?.pendingVouchers || [];
    const recentActivity = data?.recentActivity || [];

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                            Director Approval Portal
                        </h1>
                        <span className="user-role-badge role-director">
                            Executive Authority
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Review, sign approvals, and manage enterprise expense vouchers across ABC Company.
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('/vouchers')}
                    className="btn btn-outline"
                >
                    <FileText size={18} />
                    <span>View All Vouchers</span>
                </button>
            </div>

            {error && (
                <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--warning-500)' }}>
                    <div className="stat-card-top">
                        <span className="stat-label">Pending Approval Count</span>
                        <div className="stat-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--warning-700)' }}>
                        {stats.pendingApprovalCount}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Require your digital signature</span>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                    <div className="stat-card-top">
                        <span className="stat-label">Total Pending Amount</span>
                        <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                            <IndianRupee size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }}>
                        {formatCurrency(stats.totalPendingAmount)}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Awaiting reimbursement sign-off</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Approved Today</span>
                        <div className="stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--success-700)' }}>
                        {stats.approvedToday}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lifetime Approved: {stats.totalApprovedCount}</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Rejected Today</span>
                        <div className="stat-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                            <XCircle size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--danger-700)' }}>
                        {stats.rejectedToday}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lifetime Rejected: {stats.totalRejectedCount}</span>
                </div>
            </div>

            {/* Pending Approvals Table (Primary focus for Director) */}
            <div className="card mb-4" style={{ border: '1.5px solid var(--warning-200)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)' }}>
                <div className="card-header" style={{ background: 'var(--warning-50)' }}>
                    <div>
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning-900)' }}>
                            <Clock size={20} color="var(--warning-600)" />
                            <span>Vouchers Pending Your Approval ({pendingVouchers.length})</span>
                        </h2>
                        <span style={{ fontSize: '0.82rem', color: 'var(--warning-700)' }}>
                            Requires Director review and signature before Accounts reimbursement
                        </span>
                    </div>
                    <button
                        onClick={() => onNavigate('/vouchers?status=Pending%20Approval')}
                        className="btn btn-sm btn-outline"
                        style={{ borderColor: 'var(--warning-300)', color: 'var(--warning-900)' }}
                    >
                        <span>Filter All Pending</span>
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    {pendingVouchers.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <ShieldCheck size={44} color="var(--success-500)" style={{ margin: '0 auto 0.75rem' }} />
                            <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>All Caught Up!</p>
                            <p style={{ fontSize: '0.85rem' }}>There are no expense vouchers currently awaiting your approval.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Voucher #</th>
                                        <th>Employee / Claimant</th>
                                        <th>Expense Title</th>
                                        <th>Expense Date</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                        <th style={{ textAlign: 'center' }}>Employee Signature</th>
                                        <th style={{ textAlign: 'center' }}>Approval Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingVouchers.map((v) => (
                                        <tr key={v.id}>
                                            <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                                                {v.voucher_number}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{v.employee_name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {v.department} {v.employee_code && `(${v.employee_code})`}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{v.expense_title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {v.expense_category}
                                                </div>
                                            </td>
                                            <td>{v.expense_date}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.98rem' }}>
                                                {formatCurrency(v.amount)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {v.employee_signature ? (
                                                    <img
                                                        src={v.employee_signature}
                                                        alt="Employee Signature"
                                                        style={{ maxHeight: '35px', maxWidth: '80px', objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                    <button
                                                        onClick={() => onNavigate(`/vouchers/${v.id}`)}
                                                        className="btn btn-sm btn-outline"
                                                        title="View Voucher Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveClick(v)}
                                                        className="btn btn-sm btn-success"
                                                        title="Approve Voucher"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(v)}
                                                        className="btn btn-sm btn-danger"
                                                        title="Reject Voucher"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Voucher Activity Card */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2 className="card-title">Recent Voucher Activity (Organization-wide)</h2>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Real-time audit log of all expense claims across all company departments
                        </span>
                    </div>
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Expense Title</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((v) => (
                                    <tr key={v.id}>
                                        <td className="font-mono" style={{ fontWeight: 600 }}>{v.voucher_number}</td>
                                        <td>{v.employee_name}</td>
                                        <td>{v.department}</td>
                                        <td>{v.expense_title}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                            {formatCurrency(v.amount)}
                                        </td>
                                        <td><VoucherStatusBadge status={v.status} /></td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(v.updated_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                onClick={() => onNavigate(`/vouchers/${v.id}`)}
                                                className="btn btn-sm btn-outline"
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Approve Modal with Director Signature */}
            <ConfirmationModal
                isOpen={approveModal.isOpen}
                type="approve"
                title={`Approve Voucher: ${approveModal.voucher?.voucher_number}`}
                message={`You are approving expense claim of ${formatCurrency(approveModal.voucher?.amount)} submitted by ${approveModal.voucher?.employee_name}. As required by company policy, please provide your Director signature.`}
                confirmLabel="Approve & Sign Voucher"
                confirmVariant="success"
                isLoading={isActionLoading}
                savedSignatureUrl={user?.signature_url}
                onConfirm={handleConfirmApprove}
                onCancel={() => setApproveModal({ isOpen: false, voucher: null })}
            />

            {/* Reject Modal with Mandatory Rejection Reason */}
            <ConfirmationModal
                isOpen={rejectModal.isOpen}
                type="reject"
                title={`Reject Voucher: ${rejectModal.voucher?.voucher_number}`}
                message={`You are rejecting expense claim of ${formatCurrency(rejectModal.voucher?.amount)}. A rejection reason is mandatory and will be visible to the employee.`}
                confirmLabel="Reject Voucher"
                confirmVariant="danger"
                isLoading={isActionLoading}
                onConfirm={handleConfirmReject}
                onCancel={() => setRejectModal({ isOpen: false, voucher: null })}
            />
        </div>
    );
}
