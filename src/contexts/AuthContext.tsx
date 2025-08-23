import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void; // Add setUser function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isGoogleAuth = localStorage.getItem('isGoogleAuth');
        
        if (currentUser && authService.isAuthenticated()) {
          // For Google auth, we can use the stored user directly
          if (isGoogleAuth === 'true') {
            console.log('Restoring Google auth session:', currentUser);
            setUser(currentUser);
          } else {
            // For regular auth, verify token is still valid by calling profile endpoint
            try {
              const response = await authService.getProfile();
              setUser(response.user);
            } catch (error) {
              console.error('Token validation failed:', error);
              // Token is invalid, clear local storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('authMethod');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid session data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
        localStorage.removeItem('isGoogleAuth');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await authService.login(phone, password);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Add manual setUser function for external updates (like Google auth)
  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser: handleSetUser,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};