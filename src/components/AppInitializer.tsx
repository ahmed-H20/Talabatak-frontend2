import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';

interface AppInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ 
  children, 
  fallback = <div>جاري التحميل...</div> 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize authentication state
        const hasValidSession = authService.initializeAuth();
        
        if (hasValidSession) {
          console.log('Valid session found, user authenticated');
        } else {
          console.log('No valid session found');
        }

        // Add any other initialization logic here
        // For example: theme initialization, language settings, etc.
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        // Clear any corrupted data
        authService.logout();
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading || !isInitialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Advanced loading component with better UX
export const AppLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
          <span className="text-2xl">📱</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">جاري تحميل التطبيق</h2>
          <p className="text-muted-foreground">يرجى الانتظار...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

// Usage in your main App.tsx:
/*
import { BrowserRouter } from 'react-router-dom';
import { AppInitializer, AppLoader } from './components/AppInitializer';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AppInitializer fallback={<AppLoader />}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppInitializer>
  );
}

export default App;
*/