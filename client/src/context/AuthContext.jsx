import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ id: decoded.id, role: decoded.role });
                }
            } catch (err) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, role: decoded.role, name: userData.name });
        return { role: decoded.role };
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        const { token, user: data } = res.data;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, role: decoded.role, name: data.name });
        return { role: decoded.role };
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
