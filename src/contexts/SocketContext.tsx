import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showNotification, playNotificationSound, triggerVisualNotification } = useNotification();

  const connect = () => {
    if (socket) {
      socket.disconnect();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const socketInstance = io('https://talabatak-backend2-zw4i.onrender.com', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
      
      if (user?.role === 'admin') {
        showNotification({
          title: '🔌 متصل بالخادم',
          message: 'تم الاتصال بالخادم - ستتلقى التحديثات فوراً',
          type: 'success',
          duration: 3000,
        });
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      if (user?.role === 'admin') {
        showNotification({
          title: '⚠️ انقطع الاتصال',
          message: 'انقطع الاتصال بالخادم - جاري المحاولة للاتصال مرة أخرى',
          type: 'error',
          duration: 5000,
        });
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
      setIsConnected(false);
    });

    // Order events (for admin users)
    if (user?.role === 'admin') {
      socketInstance.on('orderCreated', (newOrder) => {
        console.log('📦 New order received:', newOrder);
        
        // Trigger comprehensive notification
        const title = '🔔 طلب جديد!';
        const message = `طلب جديد من ${newOrder.user?.name || 'مستخدم'} - ${newOrder.totalPrice?.toFixed(2)} جنيه`;
        
        // Show notification with all effects
        showNotification({
          title,
          message,
          type: 'info',
          duration: 10000,
          playSound: true,
          showBrowserNotification: true,
          flashScreen: true,
          vibrate: true,
        });
      });

      socketInstance.on('orderStatusUpdated', (updatedOrder) => {
        console.log('📝 Order status updated:', updatedOrder);
        
        showNotification({
          title: '✅ تم تحديث الطلب',
          message: `تم تحديث حالة الطلب #${updatedOrder._id?.slice(-8)} إلى ${getStatusText(updatedOrder.status)}`,
          type: 'success',
          duration: 5000,
        });
      });

      socketInstance.on('orderCancelled', (cancelledOrder) => {
        console.log('❌ Order cancelled:', cancelledOrder);
        
        showNotification({
          title: '❌ تم إلغاء الطلب',
          message: `تم إلغاء الطلب #${cancelledOrder._id?.slice(-8)}`,
          type: 'warning',
          duration: 5000,
        });
      });
    }

    // Delivery events (for delivery users)
    if (user?.role === 'delivery') {
      socketInstance.on('deliveryAssigned', (deliveryInfo) => {
        console.log('🚚 Delivery assigned:', deliveryInfo);
        
        showNotification({
          title: '🚚 مهمة توصيل جديدة',
          message: `تم تعيين مهمة توصيل جديدة لك`,
          type: 'info',
          duration: 8000,
          playSound: true,
          showBrowserNotification: true,
          vibrate: true,
        });
      });

      socketInstance.on('deliveryStatusUpdated', (deliveryInfo) => {
        console.log('📍 Delivery status updated:', deliveryInfo);
        
        showNotification({
          title: '📍 تحديث حالة التوصيل',
          message: `تم تحديث حالة التوصيل`,
          type: 'info',
          duration: 3000,
        });
      });
    }

    // General user events
    if (user?.role === 'user') {
      socketInstance.on('orderStatusUpdated', (updatedOrder) => {
        console.log('📦 Your order status updated:', updatedOrder);
        
        showNotification({
          title: '📦 تحديث طلبك',
          message: `تم تحديث حالة طلبك إلى ${getStatusText(updatedOrder.status)}`,
          type: 'info',
          duration: 6000,
          showBrowserNotification: true,
          vibrate: true,
        });
      });

      socketInstance.on('deliveryAssigned', (deliveryInfo) => {
        console.log('🚚 Delivery assigned to your order:', deliveryInfo);
        
        showNotification({
          title: '🚚 تم تعيين مندوب',
          message: `تم تعيين مندوب توصيل لطلبك`,
          type: 'success',
          duration: 5000,
          showBrowserNotification: true,
        });
      });
    }

    setSocket(socketInstance);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      console.log('🔌 Socket disconnected manually');
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'processing': return 'قيد المعالجة';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`🔌 Connecting socket for user role: ${user.role}`);
      connect();
    } else {
      console.log('🔌 Disconnecting socket - user not authenticated');
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Listen for auth state changes from AuthContext
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      const { user: authUser, isAuthenticated: authIsAuthenticated } = event.detail;
      
      if (authIsAuthenticated && authUser) {
        console.log(`🔌 Auth state changed - connecting socket for: ${authUser.name} (${authUser.role})`);
        // Small delay to ensure token is properly stored
        setTimeout(() => {
          connect();
        }, 100);
      } else {
        console.log('🔌 Auth state changed - disconnecting socket');
        disconnect();
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    };
  }, []);

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user && !isConnected) {
        console.log('🔌 Reconnecting socket due to tab visibility change');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user, isConnected]);

  const value = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};