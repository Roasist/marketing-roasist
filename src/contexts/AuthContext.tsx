import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { ApiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('roasist_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('roasist_auth_token');
      if (savedToken) {
        try {
          const res = await ApiService.verifyToken();
          setUser(res.user);
          setToken(savedToken);
        } catch {
          // Token invalid or expired
          ApiService.removeToken();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      ApiService.setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await ApiService.logout();
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      ApiService.removeToken();
      setIsLoading(false);
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
