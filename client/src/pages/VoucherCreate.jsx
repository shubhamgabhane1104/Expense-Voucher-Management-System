import React, { useState } from 'react';
import { createVoucherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SignaturePadOrUpload from '../components/SignaturePadOrUpload';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export default function VoucherCreate({ onNavigate }) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        expense_date: new Date().toISOString().split('T')[0],
        department: user?.department || 'Engineering',
        expense_title: '',
        expense_category: 'Software & Tools',
        expense_description: '',
        amount: ''
    });

    const [signatureData, setSignatureData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = (isSubmitting) => {
        const newErrors = {};

        if (!formData.department.trim()) {
            newErrors.department = 'Department is mandatory.';
        }
        if (!formData.expense_title.trim()) {
            newErrors.expense_title = 'Expense title is mandatory.';
        }
        if (!formData.expense_date) {
            newErrors.expense_date = 'Expense date is mandatory.';
        }
        if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount is mandatory and must be greater than zero.';
        }

        if (isSubmitting) {
            const hasSig = signatureData?.file || signatureData?.dataUrl;
            if (!hasSig && !user?.signature_url) {
                newErrors.signature = 'Employee signature is mandatory before submission.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (submitForApproval = false) => {
        if (!validateForm(submitForApproval)) {
            return;
        }

        setIsLoading(true);
        try {
            // Build FormData for file or dataUrl upload
            const data = new FormData();
            data.append('expense_date', formData.expense_date);
            data.append('department', formData.department);
            data.append('expense_title', formData.expense_title);
            data.append('expense_category', formData.expense_category);
            data.append('expense_description', formData.expense_description);
            data.append('amount', formData.amount);
            data.append('status', submitForApproval ? 'Pending Approval' : 'Draft');

            if (signatureData?.file) {
                data.append('signature', signatureData.file);
            } else if (signatureData?.dataUrl) {
                data.append('employee_signature', signatureData.dataUrl);
            }

            const res = await createVoucherApi(data);

            if (submitForApproval) {
                try {
                    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                } catch {}
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                onNavigate(`/vouchers/${res.voucher.id}`);
            }, 800);
        } catch (err) {
            setErrors(prev => ({ ...prev, api: err.message || 'Failed to save voucher' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="flex-between mb-2">
                <button onClick={() => onNavigate('/vouchers')} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Vouchers
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        className="btn btn-secondary"
                        disabled={isLoading}
                    >
                        <Save size={16} /> Save as Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(true)}
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        <Send size={16} /> Submit for Approval
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <h1 className="card-title" style={{ fontSize: '1.4rem' }}>
                            Create Expense Voucher
                        </h1>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Fill out the required expense details below. You can save as Draft or submit directly with your digital signature.
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

                    {submitSuccess && (
                        <div style={{ background: 'var(--success-50)', color: 'var(--success-700)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} />
                            <span>Voucher saved successfully! Redirecting...</span>
                        </div>
                    )}

                    {/* Claimant Info Card (Auto-populated) */}
                    <div style={{ background: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Claimant Information (Auto-Populated)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Employee Name: </span>
                                <strong>{user?.name}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Employee ID: </span>
                                <strong>{user?.employee_code || 'EMP-AUTO'}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Voucher Date: </span>
                                <strong>{new Date().toISOString().split('T')[0]} (Today)</strong>
                            </div>
                        </div>
                    </div>

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
                                    placeholder="e.g. Flight to Mumbai client on-site meeting"
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
                                placeholder="0.00"
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
                                placeholder="Provide itemized details, vendor names, project code, or justification..."
                                value={formData.expense_description}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Signature section */}
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <SignaturePadOrUpload
                                label="Employee Signature"
                                required={false}
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
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                ℹ️ Note: You can save this voucher as a <strong>Draft</strong> without a signature. However, submitting for Director approval requires an uploaded or drawn signature.
                            </p>
                        </div>

                        <div className="modal-footer" style={{ marginTop: '2rem', padding: '1.25rem 0 0 0', background: 'transparent' }}>
                            <button
                                type="button"
                                onClick={() => handleSave(false)}
                                className="btn btn-secondary btn-lg"
                                disabled={isLoading}
                            >
                                <Save size={18} /> Save as Draft
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isLoading}
                            >
                                <Send size={18} /> {isLoading ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
