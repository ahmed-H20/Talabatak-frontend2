import { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const BaseLayout = ({ 
  children, 
  className = '',
  dir = 'ltr' 
}: BaseLayoutProps) => {
  return (
    <div 
      dir={dir}
      className={`min-h-screen bg-background text-foreground transition-normal ${className}`}
    >
      {children}
    </div>
  );
};