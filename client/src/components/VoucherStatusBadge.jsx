import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

export default function VoucherStatusBadge({ status }) {
    switch (status) {
        case 'Draft':
            return (
                <span className="status-badge badge-draft">
                    <FileEdit size={14} />
                    <span>Draft</span>
                </span>
            );
        case 'Pending Approval':
            return (
                <span className="status-badge badge-pending">
                    <Clock size={14} />
                    <span>Pending Approval</span>
                </span>
            );
        case 'Approved':
            return (
                <span className="status-badge badge-approved">
                    <CheckCircle2 size={14} />
                    <span>Approved</span>
                </span>
            );
        case 'Rejected':
            return (
                <span className="status-badge badge-rejected">
                    <XCircle size={14} />
                    <span>Rejected</span>
                </span>
            );
        default:
            return (
                <span className="status-badge badge-draft">
                    <span>{status || 'Unknown'}</span>
                </span>
            );
    }
}
