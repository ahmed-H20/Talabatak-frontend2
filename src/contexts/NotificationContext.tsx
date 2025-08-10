import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  playSound?: boolean;
  showBrowserNotification?: boolean;
  flashScreen?: boolean;
  vibrate?: boolean;
  icon?: string;
}

interface NotificationContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => void;
  playNotificationSound: () => void;
  triggerVisualNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  // Load settings and request permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Auto-request permission if not denied
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    }
  }, []);

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Play notification sound with multiple fallback options
  const playNotificationSound = async () => {
    if (!soundEnabled) return;
    
    try {
      // Method 1: Web Audio API (most reliable)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (3 beeps)
      const now = audioContext.currentTime;
      
      // First beep
      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      // Second beep
      oscillator.frequency.setValueAtTime(1000, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      // Third beep
      oscillator.frequency.setValueAtTime(1200, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      
    } catch (error) {
      console.log('Web Audio API failed, trying alternative methods:', error);
      
      try {
        // Method 2: HTML5 Audio with data URI
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEBAA==');
        audio.volume = 0.3;
        await audio.play();
      } catch (audioError) {
        console.log('HTML5 Audio also failed:', audioError);
        
        // Method 3: System beep (last resort)
        try {
          const utterance = new SpeechSynthesisUtterance('');
          utterance.volume = 0;
          speechSynthesis.speak(utterance);
        } catch (speechError) {
          console.log('All audio methods failed:', speechError);
        }
      }
    }
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'app-notification',
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after duration
        setTimeout(() => {
          notification.close();
        }, 8000);
      } catch (error) {
        console.error('Failed to show browser notification:', error);
      }
    }
  };

  // Visual screen flash effect
  const flashScreen = () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(59, 130, 246, 0.2);
      z-index: 99999;
      pointer-events: none;
      animation: notificationFlash 0.6s ease-in-out;
    `;
    
    // Create keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes notificationFlash {
        0% { opacity: 0; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.01); }
        100% { opacity: 0; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 600);
  };

  // Vibrate device (mobile)
  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      // Pattern: vibrate, pause, vibrate, pause, vibrate
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // Change page title for attention
  const blinkPageTitle = (title: string, duration: number = 10000) => {
    const originalTitle = document.title;
    let blinkCount = 0;
    const maxBlinks = Math.floor(duration / 1000);
    
    const blinkInterval = setInterval(() => {
      document.title = blinkCount % 2 === 0 ? `🔔 ${title}` : originalTitle;
      blinkCount++;
      
      if (blinkCount >= maxBlinks * 2) {
        clearInterval(blinkInterval);
        document.title = originalTitle;
      }
    }, 1000);

    // Also clear on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearInterval(blinkInterval);
        document.title = originalTitle;
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
    
    if (document.hidden) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  // Trigger visual notification effects
  const triggerVisualNotification = () => {
    flashScreen();
  };

  // Main notification function
  const showNotification = (options: NotificationOptions) => {
    const {
      title,
      message,
      type = 'info',
      duration = 5000,
      playSound = false,
      showBrowserNotification: showBrowser = false,
      flashScreen: flash = false,
      vibrate = false,
      icon
    } = options;

    // 1. Always show toast notification
    toast({
      title: title,
      description: message,
      duration: duration,
      variant: type === 'error' ? 'destructive' : 'default',
    });

    // 2. Play sound if enabled and requested
    if (playSound && soundEnabled) {
      playNotificationSound();
    }

    // 3. Show browser notification if permitted and requested
    if (showBrowser) {
      showBrowserNotification(title, message, icon);
    }

    // 4. Flash screen if requested
    if (flash) {
      flashScreen();
    }

    // 5. Vibrate device if requested (mobile)
    if (vibrate) {
      vibrateDevice();
    }

    // 6. Blink page title if page is hidden (important notifications)
    if (document.hidden && (playSound || showBrowser)) {
      blinkPageTitle(title, duration);
    }
  };

  const value = {
    soundEnabled,
    setSoundEnabled,
    notificationPermission,
    requestNotificationPermission,
    showNotification,
    playNotificationSound,
    triggerVisualNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};