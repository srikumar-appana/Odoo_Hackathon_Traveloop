import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        if (shouldRedirect) {
            base44.auth.logout();
        }
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings: false,
            authError,
            appPublicSettings: null,
            authChecked: true,
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState: checkUserAuth
        }}>
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
