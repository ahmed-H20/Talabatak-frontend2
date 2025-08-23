import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

// Types
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Array<'user' | 'delivery' | 'admin'>;
  redirectTo?: string;
}

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

// Main Authentication Guard
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/auth/login'
}) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize auth on component mount
    authService.initializeAuth();
  }, []);

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user needs to complete profile
  if (authService.needsProfileCompletion()) {
    return (
      <Navigate 
        to="/complete-profile" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role permissions if specified
  if (allowedRoles.length > 0) {
    const userRole = authService.getUserRole();
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      const user = authService.getCurrentUser();
      if (user) {
        switch (user.role) {
          case 'admin':
            return <Navigate to="/admin/dashboard" replace />;
          case 'delivery':
            return <Navigate to="/deliveryDashboard" replace />;
          default:
            return <Navigate to="/" replace />;
        }
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Profile Completion Guard - ensures profile is completed
export const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({ children }) => {
  const location = useLocation();

  // Must be authenticated first
  if (!authService.isAuthenticated()) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Must have incomplete profile to access this route
  if (!authService.needsProfileCompletion()) {
    // Profile is complete, redirect to appropriate dashboard
    const user = authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'delivery':
          return <Navigate to="/deliveryDashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

// Guest Guard - for login/register pages (redirect if already authenticated)
export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (authService.isAuthenticated()) {
    // Check if needs profile completion
    if (authService.needsProfileCompletion()) {
      return <Navigate to="/complete-profile" replace />;
    }

    // Redirect to appropriate dashboard
    const user = authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'delivery':
          return <Navigate to="/deliveryDashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

// Role-based Guard
export const RoleGuard: React.FC<{
  children: React.ReactNode;
  allowedRoles: Array<'user' | 'delivery' | 'admin'>;
  fallbackComponent?: React.ReactNode;
}> = ({ children, allowedRoles, fallbackComponent }) => {
  const userRole = authService.getUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Default fallback - redirect to appropriate dashboard
    const user = authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'delivery':
          return <Navigate to="/deliveryDashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Hook for using authentication in components
export const useAuth = () => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const needsProfileCompletion = authService.needsProfileCompletion();
  const isGoogleUser = authService.isGoogleUser();
  const userRole = authService.getUserRole();

  return {
    user,
    isAuthenticated,
    needsProfileCompletion,
    isGoogleUser,
    userRole,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    completeSocialProfile: authService.completeSocialProfile.bind(authService)
  };
};