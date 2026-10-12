import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoucherStatusBadge from '../components/VoucherStatusBadge';
import { 
    Receipt, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    IndianRupee, 
    FileText, 
    Eye, 
    Printer, 
    BarChart3,
    ArrowUpRight,
    Building
} from 'lucide-react';

export default function AccountsDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await getDashboardStatsApi();
            setData(res);
        } catch (err) {
            setError(err.message || 'Failed to load accounts dashboard');
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

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading accounts dashboard...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentApproved = data?.recentApprovedVouchers || [];
    const departmentBreakdown = data?.departmentBreakdown || [];

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                            Accounts & Finance Portal
                        </h1>
                        <span className="user-role-badge role-accounts">
                            Audit & Reimbursements
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Monitor enterprise vouchers, verify claimant & Director signatures, and process approved reimbursements.
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('/vouchers')}
                    className="btn btn-primary"
                >
                    <FileText size={18} />
                    <span>Browse All Vouchers</span>
                </button>
            </div>

            {error && (
                <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--success-600)' }}>
                    <div className="stat-card-top">
                        <span className="stat-label">Total Approved Expense</span>
                        <div className="stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                            <IndianRupee size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--success-700)' }}>
                        {formatCurrency(stats.totalApprovedExpenseAmount)}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ready for bank disbursement</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Approved Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--success-700)' }}>{stats.approvedVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Signed by Executive Director</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Pending Approval</span>
                        <div className="stat-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--warning-700)' }}>{stats.pendingApproval}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Awaiting Director decision</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Rejected Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                            <XCircle size={22} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--danger-700)' }}>{stats.rejectedVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Turned down by Director</span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <span className="stat-label">Total Organization Vouchers</span>
                        <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                            <Receipt size={22} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.totalVouchers}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Pipeline: {formatCurrency(stats.totalOrganizationAmount)}</span>
                </div>
            </div>

            {/* Split layout: Recent Approved Vouchers & Department Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Recent Approved Vouchers Ready For Reimbursement */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <div>
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={18} color="var(--success-600)" />
                                <span>Recent Approved Vouchers (Payout Queue)</span>
                            </h2>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Approved by Director with verified signatures - eligible for immediate disbursement
                            </span>
                        </div>
                        <button
                            onClick={() => onNavigate('/vouchers?status=Approved')}
                            className="btn btn-sm btn-outline"
                        >
                            <span>View All Approved</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="card-body" style={{ padding: 0 }}>
                        {recentApproved.length === 0 ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>No approved vouchers waiting in disbursement queue.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Voucher #</th>
                                            <th>Employee</th>
                                            <th>Expense Title</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                            <th>Approval Date</th>
                                            <th style={{ textAlign: 'center' }}>Signatures</th>
                                            <th style={{ textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApproved.map((v) => (
                                            <tr key={v.id}>
                                                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                                                    {v.voucher_number}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{v.employee_name}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                        {v.department}
                                                    </div>
                                                </td>
                                                <td>{v.expense_title}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                                                    {formatCurrency(v.amount)}
                                                </td>
                                                <td style={{ fontSize: '0.85rem' }}>
                                                    {v.approval_date ? new Date(v.approval_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                                        {v.employee_signature && <span title="Employee Signed" style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>Emp ✓</span>}
                                                        {v.director_signature && <span title="Director Signed" style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>Dir ✓</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                        <button
                                                            onClick={() => onNavigate(`/vouchers/${v.id}`)}
                                                            className="btn btn-sm btn-outline"
                                                            title="View Details"
                                                        >
                                                            <Eye size={13} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => onNavigate(`/vouchers/${v.id}?mode=print`)}
                                                            className="btn btn-sm btn-primary"
                                                            title="Print Voucher"
                                                        >
                                                            <Printer size={13} /> Print
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

                {/* Department Distribution Insights */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={18} color="var(--primary-600)" />
                            <span>Approved Expenses by Department</span>
                        </h2>
                    </div>
                    <div className="card-body">
                        {departmentBreakdown.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No department data yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {departmentBreakdown.map((item) => (
                                    <div key={item.department} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div className="flex-between mb-1">
                                            <span style={{ fontWeight: 600 }}>{item.department}</span>
                                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                {formatCurrency(item.total_amount)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <span>{item.count} approved voucher{item.count > 1 ? 's' : ''}</span>
                                            <span>
                                                {stats.totalApprovedExpenseAmount > 0 
                                                    ? Math.round((item.total_amount / stats.totalApprovedExpenseAmount) * 100) 
                                                    : 0}% of total
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
