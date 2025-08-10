import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  Bell, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationStatusProps {
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed';
}

export const NotificationStatus = ({ 
  showControls = false, 
  size = 'sm',
  variant = 'compact'
}: NotificationStatusProps) => {
  const { isConnected } = useSocket();
  const { 
    soundEnabled, 
    setSoundEnabled, 
    notificationPermission, 
    requestNotificationPermission 
  } = useNotification();
  const { user } = useAuth();

  // Don't show for regular users if variant is compact
  if (variant === 'compact' && user?.role === 'user') {
    return null;
  }

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  const badgeSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-2">
      {/* Socket Connection Status */}
      <Badge 
        className={`${badgeSize} ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className={`${iconSize} mr-1`} />
            {variant === 'detailed' ? 'متصل' : ''}
          </>
        ) : (
          <>
            <WifiOff className={`${iconSize} mr-1`} />
            {variant === 'detailed' ? 'منقطع' : ''}
          </>
        )}
      </Badge>

      {/* Notification Permission Status */}
      {notificationPermission === 'granted' && (
        <Badge className={`${badgeSize} bg-blue-100 text-blue-800`}>
          <Bell className={`${iconSize} mr-1`} />
          {variant === 'detailed' ? 'التنبيهات مفعلة' : ''}
        </Badge>
      )}

      {/* Sound Status */}
      {(user?.role === 'admin' || user?.role === 'delivery') && (
        <Badge 
          className={`${badgeSize} ${
            soundEnabled 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className={`${iconSize} mr-1`} />
              {variant === 'detailed' ? 'الصوت مفعل' : ''}
            </>
          ) : (
            <>
              <VolumeX className={`${iconSize} mr-1`} />
              {variant === 'detailed' ? 'الصوت مغلق' : ''}
            </>
          )}
        </Badge>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          {(user?.role === 'admin' || user?.role === 'delivery') && (
            <Button
              variant="outline"
              size={size}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={soundEnabled ? 'bg-green-50' : 'bg-gray-50'}
            >
              {soundEnabled ? (
                <Volume2 className={iconSize} />
              ) : (
                <VolumeX className={iconSize} />
              )}
            </Button>
          )}

          {/* Notification Permission Button */}
          {notificationPermission !== 'granted' && (
            <Button
              variant="outline"
              size={size}
              onClick={requestNotificationPermission}
              className="text-orange-600 border-orange-200"
            >
              <AlertCircle className={iconSize} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationStatus;