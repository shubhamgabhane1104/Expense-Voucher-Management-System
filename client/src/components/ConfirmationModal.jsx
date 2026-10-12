import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, FileSignature } from 'lucide-react';
import SignaturePadOrUpload from './SignaturePadOrUpload';

export default function ConfirmationModal({
    isOpen,
    type = 'confirm', // 'approve' | 'reject' | 'delete' | 'confirm'
    title,
    message,
    confirmLabel = 'Confirm',
    confirmVariant = 'primary', // 'primary' | 'success' | 'danger'
    onConfirm,
    onCancel,
    isLoading = false,
    savedSignatureUrl = null
}) {
    const [signatureData, setSignatureData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        setErrorMsg('');

        if (type === 'approve') {
            const hasSig = signatureData?.file || signatureData?.dataUrl;
            if (!hasSig && !savedSignatureUrl) {
                setErrorMsg('Director signature is mandatory before approval.');
                return;
            }
            onConfirm({
                signature: hasSig ? (signatureData.file || signatureData.dataUrl) : savedSignatureUrl
            });
            return;
        }

        if (type === 'reject') {
            if (!rejectionReason.trim()) {
                setErrorMsg('Rejection reason is mandatory.');
                return;
            }
            onConfirm({ rejectionReason: rejectionReason.trim() });
            return;
        }

        onConfirm();
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {type === 'approve' && <CheckCircle color="var(--success-600)" size={20} />}
                        {type === 'reject' && <XCircle color="var(--danger-600)" size={20} />}
                        {type === 'delete' && <AlertTriangle color="var(--danger-600)" size={20} />}
                        {title}
                    </h3>
                    <button onClick={onCancel} className="btn btn-sm btn-outline" style={{ padding: '4px', border: 'none' }}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    {message && <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{message}</p>}

                    {errorMsg && (
                        <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {errorMsg}
                        </div>
                    )}

                    {type === 'approve' && (
                        <div>
                            <SignaturePadOrUpload
                                label="Director Approval Signature"
                                required={true}
                                onSignatureChange={(sig) => {
                                    setSignatureData(sig);
                                    if (sig?.preview) setErrorMsg('');
                                }}
                                savedSignatureUrl={savedSignatureUrl}
                            />
                        </div>
                    )}

                    {type === 'reject' && (
                        <div className="form-group">
                            <label className="form-label">
                                Rejection Reason <span className="required">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows={4}
                                placeholder="Specify the exact reason for rejecting this voucher (e.g. Missing tax invoice, expense outside allowable policy limits)..."
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    if (e.target.value.trim()) setErrorMsg('');
                                }}
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`btn btn-${confirmVariant}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
