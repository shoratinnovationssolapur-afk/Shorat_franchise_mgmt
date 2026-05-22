// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Correctly initialize state, perhaps from localStorage
    const [authToken, setAuthToken] = useState(
        localStorage.getItem('access_token') || localStorage.getItem('token') || null
    );

    const login = (token) => {
        setAuthToken(token);
        localStorage.setItem('access_token', token);
    };

    const logout = () => {
        setAuthToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
    };

    // The key is to correctly pass an object to the value prop
    // with the `authToken` property.
    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
