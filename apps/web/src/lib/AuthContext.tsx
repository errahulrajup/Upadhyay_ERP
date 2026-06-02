import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PURCHASE_MANAGER' 
  | 'PRODUCTION_MANAGER' 
  | 'PRODUCTION_OPERATOR' 
  | 'QA_OFFICER' 
  | 'SANITATION_OFFICER' 
  | 'DISPATCH_MANAGER' 
  | 'ACCOUNT_MANAGER' 
  | 'HR_MANAGER' 
  | 'HELPER';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Default to SUPER_ADMIN for testing the full UI
    // In a real app, this would verify a JWT token with Supabase auth.getSession()
    const savedRole = localStorage.getItem('erp_mock_role') as UserRole || 'SUPER_ADMIN';
    setUser({
      id: 'mock-user-123',
      name: 'System Admin',
      email: 'admin@upadhyayerp.com',
      role: savedRole
    });
  }, []);

  const login = (role: UserRole) => {
    localStorage.setItem('erp_mock_role', role);
    setUser({
      id: `mock-${role.toLowerCase()}`,
      name: `Mock ${role}`,
      email: `${role.toLowerCase()}@upadhyayerp.com`,
      role
    });
  };

  const logout = () => {
    localStorage.removeItem('erp_mock_role');
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
