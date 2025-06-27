'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: string | null;
  login: (userData: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('supabase_token');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData: string) => {
    localStorage.setItem('supabase_token', userData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('supabase_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
