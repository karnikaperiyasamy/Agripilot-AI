import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'MERCHANT' | 'TRANSPORTER' | 'EXPERT' | 'CONSUMER' | 'ADMIN';
  phone?: string;
  languagePref?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: User['role']) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agritwin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('agritwin_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('agritwin_token', data.data.token);
        localStorage.setItem('agritwin_user', JSON.stringify(data.data.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agritwin_token');
    localStorage.removeItem('agritwin_user');
  };

  const switchDemoRole = async (role: User['role']) => {
    const roleEmails: Record<User['role'], string> = {
      FARMER: 'farmer@farmprofit.com',
      MERCHANT: 'merchant@agritwin.com',
      TRANSPORTER: 'transporter@agritwin.com',
      EXPERT: 'expert@agritwin.com',
      CONSUMER: 'consumer@agritwin.com',
      ADMIN: 'admin@agritwin.com'
    };
    await login(roleEmails[role], 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        switchDemoRole,
        isAuthenticated: !!token && !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
