import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, deleteVoucherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoucherStatusBadge from '../components/VoucherStatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    PlusCircle, 
    Receipt, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    FileEdit, 
    Eye, 
    Trash2, 
    IndianRupee,
    ArrowUpRight
} from 'lucide-react';

export default function EmployeeDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, voucher: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await getDashboardStatsApi();
            setData(res);
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
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

    const handleDeleteClick = (voucher) => {
        setDeleteModalState({ isOpen: true, voucher });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalState.voucher) return;
        setIsDeleting(true);
        try {
            await deleteVoucherApi(deleteModalState.voucher.id);
            setDeleteModalState({ isOpen: false, voucher: null });
            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to delete voucher');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading employee dashboard...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentVouchers = data?.recentVouchers || [];

    return (
        <div>
            {/* Header with CTA */}
            <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        Welcome back, {user?.name}!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Track your reimbursement claims, draft expenses, and approval status.
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('/vouchers/create')}
                    className="btn btn-primary"
                >
                    <PlusCircle size={18} />
                    <span>Create Expense Voucher</span>
                </button>
            </div>

            {error && (
                <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {/* KPI Metric Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Total Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                            <Receipt size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.totalVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>All claims submitted by you</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Draft Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                            <FileEdit size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.draftVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Editable before submission</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Pending Approval</span>
                        <div className="stat-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.pendingApproval}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--warning-700)' }}>Awaiting Director review</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Approved Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.approvedVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--success-700)' }}>Sent to Accounts for payout</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Rejected Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                            <XCircle size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.rejectedVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--danger-700)' }}>Reason provided by Director</span>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                    <div className="stat-card-top">
                        <span className="stat-label">Total Claimed</span>
                        <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                            <IndianRupee size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }}>
                        {formatCurrency(stats.totalAmountClaimed)}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Approved: {formatCurrency(stats.totalApprovedAmount)}
                    </span>
                </div>
            </div>

            {/* Recent Vouchers Card */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2 className="card-title">Recent Voucher Activity</h2>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Latest expense submissions created by you
                        </span>
                    </div>
                    <button
                        onClick={() => onNavigate('/vouchers')}
                        className="btn btn-sm btn-outline"
                    >
                        <span>View All Vouchers</span>
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    {recentVouchers.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Receipt size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <p style={{ fontWeight: 600 }}>No expense vouchers found</p>
                            <p style={{ fontSize: '0.85rem' }}>Click "Create Expense Voucher" above to submit your first claim.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Voucher #</th>
                                        <th>Expense Title</th>
                                        <th>Expense Date</th>
                                        <th>Category</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVouchers.map((v) => (
                                        <tr key={v.id}>
                                            <td className="font-mono" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                                {v.voucher_number}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{v.expense_title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {v.department}
                                                </div>
                                            </td>
                                            <td>{v.expense_date}</td>
                                            <td>
                                                <span style={{ background: 'var(--bg-surface-alt)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                    {v.expense_category}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                {formatCurrency(v.amount)}
                                            </td>
                                            <td>
                                                <VoucherStatusBadge status={v.status} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                    <button
                                                        onClick={() => onNavigate(`/vouchers/${v.id}`)}
                                                        className="btn btn-sm btn-outline"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {v.status === 'Draft' && (
                                                        <>
                                                            <button
                                                                onClick={() => onNavigate(`/vouchers/${v.id}/edit`)}
                                                                className="btn btn-sm btn-primary"
                                                                title="Edit Draft"
                                                            >
                                                                <FileEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(v)}
                                                                className="btn btn-sm btn-danger"
                                                                title="Delete Draft"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalState.isOpen}
                type="delete"
                title="Delete Draft Voucher"
                message={`Are you sure you want to permanently delete draft voucher ${deleteModalState.voucher?.voucher_number}? This action cannot be undone.`}
                confirmLabel="Delete Draft"
                confirmVariant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalState({ isOpen: false, voucher: null })}
            />
        </div>
    );
}
