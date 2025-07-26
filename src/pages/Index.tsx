import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { DemoSection } from '@/components/ui/demo-section';
import { Button } from '@/components/ui/button';
import { Settings, ToggleRight } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [isRTL, setIsRTL] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const toggleDirection = () => {
    setIsRTL(!isRTL);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <BaseLayout dir={isRTL ? 'rtl' : 'ltr'} className={isDark ? 'dark' : ''}>
      {/* Control Panel */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={toggleDirection}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <ToggleRight className="h-4 w-4 mr-2" />
          {isRTL ? 'RTL' : 'LTR'}
        </Button>
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          {isDark ? 'Dark' : 'Light'}
        </Button>
      </div>

      {/* Main Content */}
      <Container size="full" className="py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Arabic RTL E-commerce Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Phase 1: Foundation & Design System Complete ✨
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            Beautiful, responsive, Arabic-ready design system with RTL support
          </p>
        </div>

        <DemoSection />

        {/* Footer */}
        <footer className="mt-section pt-8 border-t border-light text-center text-muted-foreground">
          <p>Built with React, TypeScript, Tailwind CSS & Arabic RTL Support</p>
        </footer>
      </Container>
    </BaseLayout>
  );
};

export default Index;
