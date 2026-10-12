import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, ArrowRightLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, onQuickSwitchRole }) {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(
        () => localStorage.getItem('ev_theme') || 'light'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ev_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <header className="top-navbar no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onToggleSidebar}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '8px', display: 'none' }}
                    id="mobile-nav-toggle"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                        {user ? `${user.role.toUpperCase()} PORTAL` : 'VOUCHER MANAGEMENT'}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {user ? `${user.department || 'Corporate'} Office` : ''}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Evaluator Quick Role Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface-alt)', padding: '4px 8px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowRightLeft size={13} /> Demo Roles:
                    </span>
                    <button
                        className={`btn btn-sm ${user?.role === 'employee' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => onQuickSwitchRole && onQuickSwitchRole('employee@abc.com', 'employee123')}
                    >
                        Employee
                    </button>
                    <button
                        className={`btn btn-sm ${user?.role === 'director' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => onQuickSwitchRole && onQuickSwitchRole('director@abc.com', 'director123')}
                    >
                        Director
                    </button>
                    <button
                        className={`btn btn-sm ${user?.role === 'accounts' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => onQuickSwitchRole && onQuickSwitchRole('accounts@abc.com', 'accounts123')}
                    >
                        Accounts
                    </button>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn btn-sm btn-outline"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    style={{ padding: '8px', borderRadius: '50%' }}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="btn btn-sm btn-outline"
                    style={{ color: 'var(--danger-600)', borderColor: 'var(--danger-100)' }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </header>
    );
}
