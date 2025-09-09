// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles?: string[]; 
// }

// export const ProtectedRoute = ({ children,allowedRoles }: ProtectedRouteProps) => {
//   const { isAuthenticated, loading, user } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     // Redirect to login page with return url
//     return <Navigate to="/auth/login" state={{ from: location }} replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user?.role)) {
//     return <Navigate to="/auth/login" replace />;
//   }

//   return <>{children}</>;
// };
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If it's an admin route, redirect to not-authorized page
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/not-authorized" replace />;
    }
    // For other role restrictions, redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};