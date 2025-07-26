import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  size?: 'mobile' | 'tablet' | 'desktop' | 'full';
  className?: string;
}

export const Container = ({ 
  children, 
  size = 'desktop',
  className = '' 
}: ContainerProps) => {
  const sizeClasses = {
    mobile: 'container-mobile',
    tablet: 'container-tablet', 
    desktop: 'container-desktop',
    full: 'w-full px-4 sm:px-6 lg:px-8'
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
};