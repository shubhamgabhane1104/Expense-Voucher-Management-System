import React from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import VoucherStatusBadge from './VoucherStatusBadge';

export default function VoucherPrintView({ voucher, onBack }) {
    if (!voucher) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amt || 0);
    };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div className="no-print flex-between mb-2">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Details
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                    <Printer size={16} /> Print Official Voucher
                </button>
            </div>

            <div 
                className="card printable-voucher" 
                style={{ 
                    padding: '2.5rem', 
                    background: '#ffffff', 
                    color: '#0f172a', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}
            >
                {/* Formal Corporate Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>ABC COMPANY</h1>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Prachay Securities Financial Group</p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Corporate Head Office • Mumbai / Bangalore</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: '#4f46e5' }}>
                            EXPENSE VOUCHER
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
                            {voucher.voucher_number}
                        </div>
                        <div style={{ marginTop: '6px' }}>
                            <VoucherStatusBadge status={voucher.status} />
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Voucher Date</div>
                        <div style={{ fontWeight: 600 }}>{voucher.voucher_date}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Expense Date</div>
                        <div style={{ fontWeight: 600 }}>{voucher.expense_date}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department</div>
                        <div style={{ fontWeight: 600 }}>{voucher.department}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Expense Category</div>
                        <div style={{ fontWeight: 600 }}>{voucher.expense_category}</div>
                    </div>
                </div>

                {/* Employee Info */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Claimant / Employee Information
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Employee Name: </span>
                            <strong>{voucher.employee_name}</strong>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Employee ID: </span>
                            <strong>{voucher.employee_code || 'N/A'}</strong>
                        </div>
                    </div>
                </div>

                {/* Expense Details Breakdown */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Expense Itemization & Description
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left', fontSize: '0.82rem', textTransform: 'uppercase' }}>Item / Purpose</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left', fontSize: '0.82rem', textTransform: 'uppercase' }}>Detailed Explanation</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'right', fontSize: '0.82rem', textTransform: 'uppercase', width: '160px' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '1rem 0.75rem', fontWeight: 600, verticalAlign: 'top' }}>
                                    {voucher.expense_title}
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '1rem 0.75rem', color: '#334155', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                                    {voucher.expense_description || 'No detailed description provided.'}
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', verticalAlign: 'top' }}>
                                    {formatCurrency(voucher.amount)}
                                </td>
                            </tr>
                            <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                                <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'right', textTransform: 'uppercase' }}>
                                    Total Claimed Amount:
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'right', fontSize: '1.1rem', color: '#4f46e5', fontFamily: 'var(--font-mono)' }}>
                                    {formatCurrency(voucher.amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Dual Digital Signature Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #cbd5e1' }}>
                    {/* Employee Signature Block */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            Employee Signature
                        </div>
                        <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '6px', marginBottom: '0.5rem' }}>
                            {voucher.employee_signature ? (
                                <img
                                    src={voucher.employee_signature}
                                    alt="Employee Signature"
                                    style={{ maxHeight: '75px', maxWidth: '200px', objectFit: 'contain' }}
                                />
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                    [No signature uploaded]
                                </span>
                            )}
                        </div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            {voucher.employee_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Date: {voucher.voucher_date}
                        </div>
                    </div>

                    {/* Director Signature Block */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            Director Approval & Stamp
                        </div>
                        <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '6px', marginBottom: '0.5rem' }}>
                            {voucher.director_signature ? (
                                <img
                                    src={voucher.director_signature}
                                    alt="Director Signature"
                                    style={{ maxHeight: '75px', maxWidth: '200px', objectFit: 'contain' }}
                                />
                            ) : voucher.status === 'Approved' ? (
                                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>
                                    <CheckCircle2 size={16} /> Approved Digitally
                                </span>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                    {voucher.status === 'Rejected' ? 'REJECTED' : 'PENDING APPROVAL'}
                                </span>
                            )}
                        </div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            {voucher.director_name || 'Executive Director'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Approval Date: {voucher.approval_date ? new Date(voucher.approval_date).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Rejection notice if rejected */}
                {voucher.status === 'Rejected' && (
                    <div style={{ marginTop: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', color: '#991b1b' }}>
                        <strong>Rejection Reason:</strong> {voucher.rejection_reason}
                    </div>
                )}

                {/* Audit Footer */}
                <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Generated by ABC Expense Voucher System</span>
                    <span>System Record ID: {voucher.id} • Created: {new Date(voucher.created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
