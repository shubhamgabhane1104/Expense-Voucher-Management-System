import React from 'react';
import { 
    LayoutDashboard, 
    PlusCircle, 
    FileText, 
    CheckSquare, 
    Receipt, 
    LogOut,
    Building2,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentPath, onNavigate, isOpen, onClose }) {
    const { user, logout } = useAuth();
    if (!user) return null;

    const navItems = [];

    if (user.role === 'employee') {
        navItems.push(
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Create Voucher', path: '/vouchers/create', icon: PlusCircle },
            { label: 'My Vouchers', path: '/vouchers', icon: FileText }
        );
    } else if (user.role === 'director') {
        navItems.push(
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Pending Approvals', path: '/vouchers?status=Pending%20Approval', icon: CheckSquare },
            { label: 'All Vouchers', path: '/vouchers', icon: FileText }
        );
    } else if (user.role === 'accounts') {
        navItems.push(
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'All Vouchers', path: '/vouchers', icon: FileText }
        );
    }

    const getRoleClass = (role) => {
        if (role === 'employee') return 'role-employee';
        if (role === 'director') return 'role-director';
        return 'role-accounts';
    };

    return (
        <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Receipt size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="brand-title">ABC Company</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expense Voucher Hub</div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="btn btn-sm btn-outline no-print" 
                        style={{ padding: '4px', border: 'none' }}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || 
                        (item.path.includes('?') && currentPath.includes(item.path));
                    return (
                        <div
                            key={item.label}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                onNavigate(item.path);
                                if (onClose) onClose();
                            }}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                    <div className="user-name" title={user.name}>{user.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className={`user-role-badge ${getRoleClass(user.role)}`}>
                            {user.role}
                        </span>
                        {user.employee_code && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {user.employee_code}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn btn-sm btn-outline"
                    title="Log Out"
                    style={{ padding: '6px', border: 'none', color: 'var(--text-muted)' }}
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
