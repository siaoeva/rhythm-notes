import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useAuth = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Simulate an API call to fetch user data
                const response = await fetch('/api/auth/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [setUser]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, login, logout };
};

export default useAuth;