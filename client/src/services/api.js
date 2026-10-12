// API Service for Expense Voucher Management System

const API_BASE = '/api';

export const getToken = () => localStorage.getItem('ev_token');
export const setToken = (token) => localStorage.setItem('ev_token', token);
export const removeToken = () => {
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
};

export const getStoredUser = () => {
    try {
        const user = localStorage.getItem('ev_user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const setStoredUser = (user) => {
    localStorage.setItem('ev_user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = options.headers || {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is NOT FormData, set application/json
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                removeToken();
                // If on a protected page, redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (err) {
        console.error(`API Error on ${endpoint}:`, err);
        throw err;
    }
}

// Auth API
export const loginApi = async (email, password) => {
    const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
    });
    if (res.token) setToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
};

export const getMeApi = async () => {
    return request('/auth/me');
};

export const uploadUserSignatureApi = async (formDataOrDataUrl) => {
    if (formDataOrDataUrl instanceof FormData) {
        return request('/auth/signature', {
            method: 'POST',
            body: formDataOrDataUrl
        });
    } else {
        return request('/auth/signature', {
            method: 'POST',
            body: { signatureData: formDataOrDataUrl }
        });
    }
};

// Vouchers API
export const getVouchersApi = async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
            searchParams.append(key, val);
        }
    });
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/vouchers${queryString}`);
};

export const getVoucherByIdApi = async (id) => {
    return request(`/vouchers/${id}`);
};

export const createVoucherApi = async (data) => {
    if (data instanceof FormData) {
        return request('/vouchers', {
            method: 'POST',
            body: data
        });
    }
    return request('/vouchers', {
        method: 'POST',
        body: data
    });
};

export const updateVoucherApi = async (id, data) => {
    if (data instanceof FormData) {
        return request(`/vouchers/${id}`, {
            method: 'PUT',
            body: data
        });
    }
    return request(`/vouchers/${id}`, {
        method: 'PUT',
        body: data
    });
};

export const submitVoucherApi = async (id, signatureData) => {
    let body = {};
    if (signatureData instanceof FormData) {
        return request(`/vouchers/${id}/submit`, {
            method: 'POST',
            body: signatureData
        });
    }
    if (typeof signatureData === 'string') {
        body = { signature: signatureData };
    }
    return request(`/vouchers/${id}/submit`, {
        method: 'POST',
        body
    });
};

export const deleteVoucherApi = async (id) => {
    return request(`/vouchers/${id}`, {
        method: 'DELETE'
    });
};

export const approveVoucherApi = async (id, directorSignature) => {
    if (directorSignature instanceof FormData) {
        return request(`/vouchers/${id}/approve`, {
            method: 'POST',
            body: directorSignature
        });
    }
    return request(`/vouchers/${id}/approve`, {
        method: 'POST',
        body: { director_signature: directorSignature }
    });
};

export const rejectVoucherApi = async (id, rejectionReason) => {
    return request(`/vouchers/${id}/reject`, {
        method: 'POST',
        body: { rejection_reason: rejectionReason }
    });
};

// Dashboard API
export const getDashboardStatsApi = async () => {
    return request('/dashboard/stats');
};
