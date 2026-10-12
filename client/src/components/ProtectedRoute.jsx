import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children, onNavigate }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying security session...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) {
        if (onNavigate) {
            onNavigate('/login');
        }
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="card" style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem' }}>
                <ShieldAlert size={48} color="var(--danger-600)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Access Denied (403)</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Your current role is <strong>{user.role}</strong>. This page requires one of the following roles: <strong>{allowedRoles.join(', ')}</strong>.
                </p>
                <button onClick={() => onNavigate('/dashboard')} className="btn btn-primary">
                    Return to Your Dashboard
                </button>
            </div>
        );
    }

    return children;
}
