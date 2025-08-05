
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/layout/AppHeader';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import LockScreen from './LockScreen';

interface MainLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {
  const { t, isLocked } = useSettings();
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    const year = new Date().getFullYear();
    setFooterText(t('footer.copyright', '© {year} VigiaTemp. Todos os direitos reservados a Irineu Marcos', { year }));
  }, [t]);
  
  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      <footer className="bg-primary text-primary-foreground text-center p-4 text-sm">
        {footerText || <>&nbsp;</>}
      </footer>
      <Toaster />
    </div>
  );
}


export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SettingsProvider>
      <LayoutContent>{children}</LayoutContent>
    </SettingsProvider>
  );
}
