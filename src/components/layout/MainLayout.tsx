
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
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    const year = new Date().getFullYear();
    setFooterText(t('footer.copyright', '© 2025 VigiaTemp. Todos os direitos reservados a Irineu Marcos Bartnik', { year: 2025 }));
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
        <p>{footerText || <>&nbsp;</>}</p>
        <p className="mt-2 italic">"Sabedoria é construir sistemas que permaneçam úteis mesmo após o criador partir."   *&gt;&gt;I.M.B.&lt;&lt;*</p>
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
