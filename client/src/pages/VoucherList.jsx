import React, { useState, useEffect } from 'react';
import { getVouchersApi, deleteVoucherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoucherStatusBadge from '../components/VoucherStatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
    Search, 
    Filter, 
    RotateCcw, 
    PlusCircle, 
    Eye, 
    FileEdit, 
    Trash2, 
    Printer, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight,
    IndianRupee,
    SlidersHorizontal
} from 'lucide-react';

const DEPARTMENTS = [
    'All Departments',
    'Engineering',
    'Marketing',
    'Sales & Business Dev',
    'Finance & Accounts',
    'Human Resources',
    'Operations & Admin',
    'Legal & Compliance'
];

const CATEGORIES = [
    'All Categories',
    'Software & Tools',
    'Travel & Commute',
    'Meals & Entertainment',
    'Hardware & Equipment',
    'Office Supplies',
    'Client Meeting',
    'Training & Certification',
    'Miscellaneous'
];

export default function VoucherList({ onNavigate, initialStatus = 'all' }) {
    const { user } = useAuth();

    // Filters state
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(initialStatus || 'all');
    const [department, setDepartment] = useState('all');
    const [category, setCategory] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [page, setPage] = useState(1);

    const [vouchers, setVouchers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });
    const [loading, setLoading] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Delete modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, voucher: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const params = {
                search: search.trim(),
                status: status === 'all' ? undefined : status,
                department: department === 'all' ? undefined : department,
                category: category === 'all' ? undefined : category,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                min_amount: minAmount || undefined,
                max_amount: maxAmount || undefined,
                sort_by: sortBy,
                sort_order: sortOrder,
                page,
                limit: 15
            };

            const res = await getVouchersApi(params);
            setVouchers(res.data || []);
            setPagination(res.pagination || { total: 0, totalPages: 1, limit: 15 });
        } catch (err) {
            console.error('Failed to fetch vouchers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [status, department, category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchVouchers();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('all');
        setDepartment('all');
        setCategory('all');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('created_at');
        setSortOrder('DESC');
        setPage(1);
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amt || 0);
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.voucher) return;
        setIsDeleting(true);
        try {
            await deleteVoucherApi(deleteModal.voucher.id);
            setDeleteModal({ isOpen: false, voucher: null });
            fetchVouchers();
        } catch (err) {
            alert(err.message || 'Failed to delete draft voucher');
        } finally {
            setIsDeleting(false);
        }
    };

    const statuses = [
        { id: 'all', label: 'All Vouchers' },
        { id: 'Pending Approval', label: 'Pending Approval' },
        { id: 'Approved', label: 'Approved' },
        { id: 'Rejected', label: 'Rejected' },
        { id: 'Draft', label: 'Draft' }
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        {user?.role === 'employee' ? 'My Expense Vouchers' : 'Organization Expense Vouchers'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {user?.role === 'employee' 
                            ? 'All expense vouchers created and submitted by you' 
                            : 'Enterprise repository of employee expense claims and approval audits'}
                    </p>
                </div>

                {user?.role === 'employee' && (
                    <button onClick={() => onNavigate('/vouchers/create')} className="btn btn-primary">
                        <PlusCircle size={18} /> Create Voucher
                    </button>
                )}
            </div>

            {/* Quick Status Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {statuses.map(s => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => { setStatus(s.id); setPage(1); }}
                        className={`btn btn-sm ${status === s.id ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: 'var(--radius-full)' }}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="card mb-4" style={{ padding: '1.25rem' }}>
                <form onSubmit={handleSearchSubmit}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '2.4rem' }}
                                placeholder="Search by Voucher #, employee name, title, department..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="form-control"
                            style={{ width: 'auto', minWidth: '160px' }}
                            value={department}
                            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                        >
                            {DEPARTMENTS.map(d => (
                                <option key={d} value={d === 'All Departments' ? 'all' : d}>{d}</option>
                            ))}
                        </select>

                        <button type="submit" className="btn btn-primary">
                            <Search size={16} /> Search
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-outline'}`}
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="btn btn-outline"
                            title="Reset all filters"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>

                    {/* Expandable Advanced Filters (Date Range & Amount Range) */}
                    {showAdvancedFilters && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Expense Category</label>
                                <select
                                    className="form-control"
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c === 'All Categories' ? 'all' : c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Expense Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Expense Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Min Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    value={minAmount}
                                    onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Max Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="50000"
                                    value={maxAmount}
                                    onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Sort By</label>
                                <select
                                    className="form-control"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="created_at">Creation Date</option>
                                    <option value="expense_date">Expense Date</option>
                                    <option value="amount">Amount</option>
                                    <option value="voucher_number">Voucher #</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Sort Order</label>
                                <select
                                    className="form-control"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="DESC">Descending (Highest / Newest)</option>
                                    <option value="ASC">Ascending (Lowest / Oldest)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Results Table */}
            <div className="card">
                <div className="card-header flex-between">
                    <div>
                        <span style={{ fontWeight: 700 }}>
                            {pagination.total} Voucher{pagination.total === 1 ? '' : 's'} Found
                        </span>
                        {status !== 'all' && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}> • Filtered by {status}</span>}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Page {pagination.page} of {pagination.totalPages || 1}
                    </span>
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>Loading vouchers matching your criteria...</p>
                        </div>
                    ) : vouchers.length === 0 ? (
                        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Filter size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>No matching vouchers found</p>
                            <p style={{ fontSize: '0.85rem' }}>Try clearing filters or search terms.</p>
                            <button onClick={handleResetFilters} className="btn btn-outline btn-sm mt-2">
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Voucher #</th>
                                        {user?.role !== 'employee' && <th>Employee</th>}
                                        <th>Expense Title</th>
                                        <th>Department</th>
                                        <th>Expense Date</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Signatures</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vouchers.map((v) => (
                                        <tr key={v.id}>
                                            <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                                                {v.voucher_number}
                                            </td>
                                            {user?.role !== 'employee' && (
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{v.employee_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.employee_code}</div>
                                                </td>
                                            )}
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{v.expense_title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.expense_category}</div>
                                            </td>
                                            <td>{v.department}</td>
                                            <td>{v.expense_date}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                                                {formatCurrency(v.amount)}
                                            </td>
                                            <td>
                                                <VoucherStatusBadge status={v.status} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '3px' }}>
                                                    {v.employee_signature ? (
                                                        <span title="Employee Signature Present" style={{ fontSize: '0.72rem', background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>Emp ✓</span>
                                                    ) : (
                                                        <span title="No Employee Signature" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>-</span>
                                                    )}
                                                    {v.director_signature ? (
                                                        <span title="Director Signature Present" style={{ fontSize: '0.72rem', background: 'var(--success-50)', color: 'var(--success-700)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>Dir ✓</span>
                                                    ) : (
                                                        <span title="No Director Signature" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>-</span>
                                                    )}
                                                </div>
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
                                                    <button
                                                        onClick={() => onNavigate(`/vouchers/${v.id}?mode=print`)}
                                                        className="btn btn-sm btn-outline"
                                                        title="Print Voucher"
                                                    >
                                                        <Printer size={14} />
                                                    </button>
                                                    {user?.role === 'employee' && v.status === 'Draft' && (
                                                        <>
                                                            <button
                                                                onClick={() => onNavigate(`/vouchers/${v.id}/edit`)}
                                                                className="btn btn-sm btn-primary"
                                                                title="Edit Draft"
                                                            >
                                                                <FileEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteModal({ isOpen: true, voucher: v })}
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

                {/* Pagination footer */}
                {pagination.totalPages > 1 && (
                    <div className="card-header flex-between" style={{ background: 'var(--bg-surface-alt)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Showing page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-sm btn-outline"
                                disabled={pagination.page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                className="btn btn-sm btn-outline"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                type="delete"
                title="Delete Draft Voucher"
                message={`Permanently delete draft voucher ${deleteModal.voucher?.voucher_number}?`}
                confirmLabel="Delete Draft"
                confirmVariant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, voucher: null })}
            />
        </div>
    );
}
