import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import VoucherCreate from './pages/VoucherCreate';
import VoucherEdit from './pages/VoucherEdit';
import VoucherDetail from './pages/VoucherDetail';
import VoucherList from './pages/VoucherList';

function MainRouter() {
    const { user, loading, login } = useAuth();
    const [currentUrl, setCurrentUrl] = useState(window.location.pathname + window.location.search);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sync with browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            setCurrentUrl(window.location.pathname + window.location.search);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (path) => {
        window.history.pushState({}, '', path);
        setCurrentUrl(path);
        window.scrollTo(0, 0);
    };

    // Quick switch role for evaluators
    const handleQuickSwitch = async (email, password) => {
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Quick switch failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading ABC Company Portal...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const [pathname, search] = currentUrl.split('?');
    const searchParams = new URLSearchParams(search || '');

    // Unauthenticated state
    if (!user) {
        return <Login onLoginSuccess={() => navigate('/dashboard')} />;
    }

    // Role-based Dashboard router
    const renderDashboard = () => {
        if (user.role === 'employee') {
            return <EmployeeDashboard onNavigate={navigate} />;
        }
        if (user.role === 'director') {
            return <DirectorDashboard onNavigate={navigate} />;
        }
        if (user.role === 'accounts') {
            return <AccountsDashboard onNavigate={navigate} />;
        }
        return <div>Unknown user role</div>;
    };

    // Route matching
    const renderContent = () => {
        // Root or /dashboard
        if (pathname === '/' || pathname === '/dashboard') {
            return renderDashboard();
        }

        // Voucher creation (Employee only)
        if (pathname === '/vouchers/create') {
            return (
                <ProtectedRoute allowedRoles={['employee']} onNavigate={navigate}>
                    <VoucherCreate onNavigate={navigate} />
                </ProtectedRoute>
            );
        }

        // Edit Voucher: /vouchers/:id/edit
        const editMatch = pathname.match(/^\/vouchers\/(\d+)\/edit$/);
        if (editMatch) {
            const voucherId = editMatch[1];
            return (
                <ProtectedRoute allowedRoles={['employee']} onNavigate={navigate}>
                    <VoucherEdit voucherId={voucherId} onNavigate={navigate} />
                </ProtectedRoute>
            );
        }

        // Single Voucher Detail: /vouchers/:id
        const detailMatch = pathname.match(/^\/vouchers\/(\d+)$/);
        if (detailMatch) {
            const voucherId = detailMatch[1];
            const isPrint = searchParams.get('mode') === 'print';
            return (
                <VoucherDetail
                    voucherId={voucherId}
                    onNavigate={navigate}
                    initialMode={isPrint ? 'print' : 'view'}
                />
            );
        }

        // Voucher List: /vouchers
        if (pathname === '/vouchers') {
            const filterStatus = searchParams.get('status') || 'all';
            return <VoucherList onNavigate={navigate} initialStatus={filterStatus} />;
        }

        // Fallback: 404
        return (
            <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Page Not Found (404)</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    The page <code>{pathname}</code> could not be found.
                </p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                    Return to Dashboard
                </button>
            </div>
        );
    };

    return (
        <div className="app-layout">
            <Sidebar
                currentPath={currentUrl}
                onNavigate={navigate}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-wrapper">
                <Navbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onQuickSwitchRole={handleQuickSwitch}
                />

                <main className="content-container">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <MainRouter />
        </AuthProvider>
    );
}
