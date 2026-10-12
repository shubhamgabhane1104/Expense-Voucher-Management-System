import React, { useState, useEffect } from 'react';
import { getVoucherByIdApi, updateVoucherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SignaturePadOrUpload from '../components/SignaturePadOrUpload';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEPARTMENTS = [
    'Engineering',
    'Marketing',
    'Sales & Business Dev',
    'Finance & Accounts',
    'Human Resources',
    'Operations & Admin',
    'Legal & Compliance'
];

const CATEGORIES = [
    'Software & Tools',
    'Travel & Commute',
    'Meals & Entertainment',
    'Hardware & Equipment',
    'Office Supplies',
    'Client Meeting',
    'Training & Certification',
    'Miscellaneous'
];

export default function VoucherEdit({ voucherId, onNavigate }) {
    const { user } = useAuth();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        expense_date: '',
        department: '',
        expense_title: '',
        expense_category: '',
        expense_description: '',
        amount: ''
    });

    const [signatureData, setSignatureData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const res = await getVoucherByIdApi(voucherId);
                const v = res.voucher;
                setVoucher(v);
                setFormData({
                    expense_date: v.expense_date,
                    department: v.department,
                    expense_title: v.expense_title,
                    expense_category: v.expense_category,
                    expense_description: v.expense_description || '',
                    amount: v.amount
                });
            } catch (err) {
                setErrors({ api: err.message || 'Failed to load voucher' });
            } finally {
                setLoading(false);
            }
        };

        fetchVoucher();
    }, [voucherId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = (isSubmitting) => {
        const newErrors = {};

        if (!formData.department.trim()) newErrors.department = 'Department is mandatory.';
        if (!formData.expense_title.trim()) newErrors.expense_title = 'Expense title is mandatory.';
        if (!formData.expense_date) newErrors.expense_date = 'Expense date is mandatory.';
        if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than zero.';
        }

        if (isSubmitting) {
            const hasSig = signatureData?.file || signatureData?.dataUrl || voucher?.employee_signature;
            if (!hasSig) {
                newErrors.signature = 'Employee signature is mandatory before submission.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (submitForApproval = false) => {
        if (!validateForm(submitForApproval)) return;

        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('expense_date', formData.expense_date);
            data.append('department', formData.department);
            data.append('expense_title', formData.expense_title);
            data.append('expense_category', formData.expense_category);
            data.append('expense_description', formData.expense_description);
            data.append('amount', formData.amount);
            if (submitForApproval) {
                data.append('submit_now', 'true');
            }

            if (signatureData?.file) {
                data.append('signature', signatureData.file);
            } else if (signatureData?.dataUrl) {
                data.append('employee_signature', signatureData.dataUrl);
            }

            const res = await updateVoucherApi(voucherId, data);

            if (submitForApproval) {
                try {
                    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                } catch {}
            }

            setSuccessMsg(res.message);
            setTimeout(() => {
                onNavigate(`/vouchers/${voucherId}`);
            }, 800);
        } catch (err) {
            setErrors(prev => ({ ...prev, api: err.message || 'Failed to update voucher' }));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading voucher details...</p>
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--danger-600)' }}>Voucher not found.</p>
                <button onClick={() => onNavigate('/vouchers')} className="btn btn-secondary mt-2">
                    Back to Vouchers
                </button>
            </div>
        );
    }

    // Business Rule Check: Vouchers not in Draft are read-only!
    if (voucher.status !== 'Draft') {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
                <Lock size={44} color="var(--warning-600)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Voucher is Read-Only</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    According to business rules, once a voucher is submitted (Status: <strong>{voucher.status}</strong>), it cannot be modified by the employee.
                </p>
                <button onClick={() => onNavigate(`/vouchers/${voucher.id}`)} className="btn btn-primary">
                    View Voucher Details
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="flex-between mb-2">
                <button onClick={() => onNavigate(`/vouchers/${voucherId}`)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Details
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        className="btn btn-secondary"
                        disabled={isSaving}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(true)}
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        <Send size={16} /> Submit for Approval
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <h1 className="card-title" style={{ fontSize: '1.35rem' }}>
                            Edit Draft Voucher: <span className="font-mono">{voucher.voucher_number}</span>
                        </h1>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Modify the details or submit for Director approval
                        </span>
                    </div>
                </div>

                <div className="card-body">
                    {errors.api && (
                        <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} />
                            <span>{errors.api}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div style={{ background: 'var(--success-50)', color: 'var(--success-700)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} />
                            <span>{successMsg} Redirecting...</span>
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleSave(true); }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Department <span className="required">*</span>
                                </label>
                                <select
                                    name="department"
                                    className="form-control"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {DEPARTMENTS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                {errors.department && <span style={{ color: 'var(--danger-600)', fontSize: '0.8rem' }}>{errors.department}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Expense Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="expense_date"
                                    className="form-control"
                                    value={formData.expense_date}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {errors.expense_date && <span style={{ color: 'var(--danger-600)', fontSize: '0.8rem' }}>{errors.expense_date}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Expense Title <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="expense_title"
                                    className="form-control"
                                    value={formData.expense_title}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.expense_title && <span style={{ color: 'var(--danger-600)', fontSize: '0.8rem' }}>{errors.expense_title}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Expense Category <span className="required">*</span>
                                </label>
                                <select
                                    name="expense_category"
                                    className="form-control"
                                    value={formData.expense_category}
                                    onChange={handleInputChange}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Claim Amount (INR ₹) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                step="0.01"
                                min="0.01"
                                className="form-control"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.amount && <span style={{ color: 'var(--danger-600)', fontSize: '0.8rem' }}>{errors.amount}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Expense Description / Business Justification
                            </label>
                            <textarea
                                name="expense_description"
                                className="form-control"
                                rows={4}
                                value={formData.expense_description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <SignaturePadOrUpload
                                label="Employee Signature"
                                initialPreview={voucher.employee_signature}
                                onSignatureChange={(sig) => {
                                    setSignatureData(sig);
                                    if (sig?.preview) {
                                        setErrors(prev => ({ ...prev, signature: null }));
                                    }
                                }}
                                savedSignatureUrl={user?.signature_url}
                            />
                            {errors.signature && (
                                <div style={{ color: 'var(--danger-600)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                                    {errors.signature}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ marginTop: '2rem', padding: '1.25rem 0 0 0', background: 'transparent' }}>
                            <button
                                type="button"
                                onClick={() => handleSave(false)}
                                className="btn btn-secondary btn-lg"
                                disabled={isSaving}
                            >
                                <Save size={18} /> Save Changes
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isSaving}
                            >
                                <Send size={18} /> {isSaving ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
