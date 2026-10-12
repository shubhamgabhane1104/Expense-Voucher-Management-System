import React, { useState, useEffect } from 'react';
import { 
    getVoucherByIdApi, 
    deleteVoucherApi, 
    submitVoucherApi, 
    approveVoucherApi, 
    rejectVoucherApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoucherStatusBadge from '../components/VoucherStatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import VoucherPrintView from '../components/VoucherPrintView';
import { 
    ArrowLeft, 
    Printer, 
    FileEdit, 
    Trash2, 
    Send, 
    Check, 
    X, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    FileText, 
    Calendar, 
    Building, 
    User, 
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VoucherDetail({ voucherId, onNavigate, initialMode = 'view' }) {
    const { user } = useAuth();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPrintMode, setIsPrintMode] = useState(initialMode === 'print');

    // Modals
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadVoucher = async () => {
        setLoading(true);
        try {
            const res = await getVoucherByIdApi(voucherId);
            setVoucher(res.voucher);
        } catch (err) {
            setError(err.message || 'Failed to load voucher details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVoucher();
    }, [voucherId]);

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amt || 0);
    };

    // Employee: Submit Draft
    const handleConfirmSubmit = async () => {
        if (!voucher.employee_signature) {
            alert('Please edit the draft to upload/draw your signature before submitting.');
            onNavigate(`/vouchers/${voucher.id}/edit`);
            return;
        }

        setActionLoading(true);
        try {
            await submitVoucherApi(voucher.id, voucher.employee_signature);
            setSubmitModalOpen(false);
            try {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch {}
            loadVoucher();
        } catch (err) {
            alert(err.message || 'Failed to submit voucher');
        } finally {
            setActionLoading(false);
        }
    };

    // Employee: Delete Draft
    const handleConfirmDelete = async () => {
        setActionLoading(true);
        try {
            await deleteVoucherApi(voucher.id);
            setDeleteModalOpen(false);
            onNavigate('/vouchers');
        } catch (err) {
            alert(err.message || 'Failed to delete voucher');
        } finally {
            setActionLoading(false);
        }
    };

    // Director: Approve
    const handleConfirmApprove = async ({ signature }) => {
        setActionLoading(true);
        try {
            await approveVoucherApi(voucher.id, signature);
            setApproveModalOpen(false);
            try {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {}
            loadVoucher();
        } catch (err) {
            alert(err.message || 'Failed to approve voucher');
        } finally {
            setActionLoading(false);
        }
    };

    // Director: Reject
    const handleConfirmReject = async ({ rejectionReason }) => {
        setActionLoading(true);
        try {
            await rejectVoucherApi(voucher.id, rejectionReason);
            setRejectModalOpen(false);
            loadVoucher();
        } catch (err) {
            alert(err.message || 'Failed to reject voucher');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading voucher details...</p>
            </div>
        );
    }

    if (error || !voucher) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
                <ShieldAlert size={44} color="var(--danger-600)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Unable to Access Voucher</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {error || 'The requested voucher could not be found or you do not have permission to view it.'}
                </p>
                <button onClick={() => onNavigate('/vouchers')} className="btn btn-primary">
                    Return to Vouchers List
                </button>
            </div>
        );
    }

    if (isPrintMode) {
        return <VoucherPrintView voucher={voucher} onBack={() => setIsPrintMode(false)} />;
    }

    const isEmployeeOwner = user?.role === 'employee' && voucher.employee_id === user.id;
    const isDirector = user?.role === 'director';

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Action Bar */}
            <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <button onClick={() => onNavigate('/vouchers')} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Vouchers
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Print / Download Button */}
                    <button onClick={() => setIsPrintMode(true)} className="btn btn-outline">
                        <Printer size={16} /> Print / Export Voucher
                    </button>

                    {/* Employee Actions on Draft */}
                    {isEmployeeOwner && voucher.status === 'Draft' && (
                        <>
                            <button
                                onClick={() => onNavigate(`/vouchers/${voucher.id}/edit`)}
                                className="btn btn-secondary"
                            >
                                <FileEdit size={16} /> Edit Draft
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(true)}
                                className="btn btn-danger"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                            <button
                                onClick={() => {
                                    if (!voucher.employee_signature) {
                                        onNavigate(`/vouchers/${voucher.id}/edit`);
                                    } else {
                                        setSubmitModalOpen(true);
                                    }
                                }}
                                className="btn btn-primary"
                            >
                                <Send size={16} /> Submit for Approval
                            </button>
                        </>
                    )}

                    {/* Director Actions on Pending Approval */}
                    {isDirector && voucher.status === 'Pending Approval' && (
                        <>
                            <button
                                onClick={() => setRejectModalOpen(true)}
                                className="btn btn-danger"
                            >
                                <X size={16} /> Reject
                            </button>
                            <button
                                onClick={() => setApproveModalOpen(true)}
                                className="btn btn-success"
                            >
                                <Check size={16} /> Approve & Sign
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Workflow Progress Timeline */}
            <div className="card mb-4" style={{ padding: '1.25rem 2rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Voucher Lifecycle Workflow
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Step 1: Draft */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary-600)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            1
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>Draft</span>
                    </div>

                    <div style={{ flex: 1, height: '3px', background: voucher.status !== 'Draft' ? 'var(--primary-600)' : 'var(--border-subtle)', margin: '0 8px', marginBottom: '20px' }} />

                    {/* Step 2: Submitted / Pending */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: voucher.status !== 'Draft' ? 'var(--warning-500)' : 'var(--border-subtle)',
                            color: voucher.status !== 'Draft' ? 'white' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            2
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>Pending Approval</span>
                    </div>

                    <div style={{ flex: 1, height: '3px', background: (voucher.status === 'Approved' || voucher.status === 'Rejected') ? (voucher.status === 'Approved' ? 'var(--success-500)' : 'var(--danger-500)') : 'var(--border-subtle)', margin: '0 8px', marginBottom: '20px' }} />

                    {/* Step 3: Final Decision */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: voucher.status === 'Approved' ? 'var(--success-600)' : (voucher.status === 'Rejected' ? 'var(--danger-600)' : 'var(--border-subtle)'),
                            color: (voucher.status === 'Approved' || voucher.status === 'Rejected') ? 'white' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {voucher.status === 'Approved' ? <Check size={18} /> : (voucher.status === 'Rejected' ? <X size={18} /> : 3)}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>
                            {voucher.status === 'Rejected' ? 'Rejected' : (voucher.status === 'Approved' ? 'Approved' : 'Director Decision')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Rejection Notice Banner if Rejected */}
            {voucher.status === 'Rejected' && (
                <div style={{ background: 'var(--danger-50)', border: '1.5px solid var(--danger-500)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlertTriangle color="var(--danger-600)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h4 style={{ color: 'var(--danger-700)', fontWeight: 700, marginBottom: '0.25rem' }}>
                            Voucher Rejected by Director ({voucher.director_name || 'Executive Director'})
                        </h4>
                        <p style={{ color: 'var(--danger-700)', fontSize: '0.92rem', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                            <strong>Official Reason:</strong> {voucher.rejection_reason}
                        </p>
                        <span style={{ fontSize: '0.78rem', color: 'var(--danger-600)' }}>
                            Rejected on: {new Date(voucher.updated_at).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Voucher Details Card */}
            <div className="card mb-4">
                <div className="card-header" style={{ padding: '1.5rem 2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                                {voucher.expense_title}
                            </h1>
                            <VoucherStatusBadge status={voucher.status} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                                {voucher.voucher_number}
                            </span>
                            <span>•</span>
                            <span>Created: {new Date(voucher.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Department: {voucher.department}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                            Total Claim Amount
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {formatCurrency(voucher.amount)}
                        </div>
                    </div>
                </div>

                <div className="card-body" style={{ padding: '2rem' }}>
                    {/* Section 1: Basic Information */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                            Basic Expense Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voucher Number</span>
                                <div className="font-mono" style={{ fontWeight: 700 }}>{voucher.voucher_number}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voucher Date</span>
                                <div style={{ fontWeight: 600 }}>{voucher.voucher_date}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expense Date</span>
                                <div style={{ fontWeight: 600 }}>{voucher.expense_date}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Department</span>
                                <div style={{ fontWeight: 600 }}>{voucher.department}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expense Category</span>
                                <div>
                                    <span style={{ background: 'var(--bg-surface-alt)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {voucher.expense_category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expense Description & Justification</span>
                            <div style={{ background: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: '8px', marginTop: '0.35rem', whiteSpace: 'pre-wrap', fontSize: '0.925rem' }}>
                                {voucher.expense_description || 'No detailed description provided.'}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Employee Information */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                            Employee & Claimant Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employee Name</span>
                                <div style={{ fontWeight: 600 }}>{voucher.employee_name}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employee ID / Code</span>
                                <div style={{ fontWeight: 600 }}>{voucher.employee_code || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Signatures & Approvals */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                            Signatures & Verification
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {/* Employee Signature */}
                            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', background: 'var(--bg-surface-alt)' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                                    Employee Submission Signature
                                </div>
                                <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '6px' }}>
                                    {voucher.employee_signature ? (
                                        <img
                                            src={voucher.employee_signature}
                                            alt="Employee Signature"
                                            style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                            No signature uploaded (Draft status)
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Signer: <strong>{voucher.employee_name}</strong>
                                </div>
                            </div>

                            {/* Director Signature */}
                            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', background: 'var(--bg-surface-alt)' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                                    Director Approval Signature
                                </div>
                                <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '6px' }}>
                                    {voucher.director_signature ? (
                                        <img
                                            src={voucher.director_signature}
                                            alt="Director Signature"
                                            style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    ) : voucher.status === 'Approved' ? (
                                        <span style={{ color: 'var(--success-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle2 size={16} /> Digitally Approved
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                            {voucher.status === 'Rejected' ? 'Application Rejected' : 'Awaiting Director Signature'}
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Approved by: <strong>{voucher.director_name || 'Pending Review'}</strong>
                                    {voucher.approval_date && (
                                        <div>Date: {new Date(voucher.approval_date).toLocaleString()}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Audit Metadata */}
                    <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span>Created: {new Date(voucher.created_at).toLocaleString()}</span>
                        <span>Last Updated: {new Date(voucher.updated_at).toLocaleString()}</span>
                        <span>System ID: #{voucher.id}</span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                type="delete"
                title="Delete Draft Voucher"
                message={`Permanently remove draft voucher ${voucher.voucher_number}? This action cannot be reversed.`}
                confirmLabel="Delete Draft"
                confirmVariant="danger"
                isLoading={actionLoading}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={submitModalOpen}
                type="confirm"
                title="Submit Voucher for Approval"
                message={`Submit voucher ${voucher.voucher_number} for Director approval? Once submitted, it will become read-only.`}
                confirmLabel="Confirm Submission"
                confirmVariant="primary"
                isLoading={actionLoading}
                onConfirm={handleConfirmSubmit}
                onCancel={() => setSubmitModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={approveModalOpen}
                type="approve"
                title={`Approve Voucher ${voucher.voucher_number}`}
                message={`Approve reimbursement of ${formatCurrency(voucher.amount)} for ${voucher.employee_name}? Please provide your Director signature.`}
                confirmLabel="Sign & Approve"
                confirmVariant="success"
                isLoading={actionLoading}
                savedSignatureUrl={user?.signature_url}
                onConfirm={handleConfirmApprove}
                onCancel={() => setApproveModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={rejectModalOpen}
                type="reject"
                title={`Reject Voucher ${voucher.voucher_number}`}
                message="Provide the reason for rejecting this voucher. The reason will be recorded and shown to the claimant."
                confirmLabel="Reject Voucher"
                confirmVariant="danger"
                isLoading={actionLoading}
                onConfirm={handleConfirmReject}
                onCancel={() => setRejectModalOpen(false)}
            />
        </div>
    );
}
