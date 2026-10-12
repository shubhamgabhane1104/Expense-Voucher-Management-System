import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Receipt, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setError('');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-app) 0%, var(--primary-50) 100%)' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 1rem', 
                        color: 'white',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                    }}>
                        <Receipt size={30} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
                        ABC Company
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Expense Voucher Management System
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', border: '1px solid var(--danger-100)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                id="login-email"
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '2.4rem' }}
                                placeholder="name@abc.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                id="login-password"
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '2.4rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : (
                            <>
                                <span>Sign In to Portal</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Quick Demo Accounts Selection */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center' }}>
                        Quick Demo Credentials (Click to Auto-fill)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
                            onClick={() => fillDemoCredentials('employee@abc.com', 'employee123')}
                        >
                            <UserCheck size={16} color="var(--primary-600)" />
                            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>Employee (Rahul Sharma)</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>employee@abc.com • employee123</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
                            onClick={() => fillDemoCredentials('director@abc.com', 'director123')}
                        >
                            <ShieldCheck size={16} color="var(--warning-600)" />
                            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>Director (Dr. Vikram Malhotra)</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>director@abc.com • director123</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
                            onClick={() => fillDemoCredentials('accounts@abc.com', 'accounts123')}
                        >
                            <Briefcase size={16} color="var(--success-600)" />
                            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>Accounts Team (Priya Sundaram)</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>accounts@abc.com • accounts123</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
