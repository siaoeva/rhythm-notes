import React, { useState, createContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Placeholder login: replace with real API call to Flask backend
    const login = (email, password) => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                setUser({ email, name: email.split('@')[0] });
                setLoading(false);
                resolve({ ok: true });
            }, 600);
        });
    };

    const register = (email, password) => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                setUser({ email, name: email.split('@')[0] });
                setLoading(false);
                resolve({ ok: true });
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};