import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Usually redirect to login, but since we auto-mock a user, this is a fallback
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Session...</div>;
  }

  // SUPER_ADMIN has access to everything
  if (user.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="animate-in" style={{ padding: '40px', textAlign: 'center', color: '#F87171' }}>
        <h2>Access Denied</h2>
        <p style={{ marginTop: '16px' }}>Your current role ({user.role}) does not have permission to view this module.</p>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>FSSAI RBAC Policy Enforcement Active.</p>
      </div>
    );
  }

  return <>{children}</>;
};
