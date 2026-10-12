import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getToken, loginApi, removeToken, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());
    const [token, setTokenState] = useState(getToken());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const currentToken = getToken();
            if (currentToken) {
                try {
                    const res = await getMeApi();
                    if (res.user) {
                        setUser(res.user);
                    }
                } catch {
                    setUser(null);
                    setTokenState(null);
                    removeToken();
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        const res = await loginApi(email, password);
        setUser(res.user);
        setTokenState(res.token);
        return res;
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setTokenState(null);
        window.location.href = '/login';
    };

    const refreshUser = async () => {
        try {
            const res = await getMeApi();
            if (res.user) {
                setUser(res.user);
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
