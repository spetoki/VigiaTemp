
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/layout/AppHeader';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {
  const { t } = useSettings();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const baseFooterText = t('footer.copyright', '© {year} VigiaTemp. Todos os direitos reservados a I.M.B');
  
  const footerText = currentYear 
    ? t('footer.copyright', '© {year} VigiaTemp. Todos os direitos reservados a I.M.B', { year: currentYear })
    : baseFooterText.replace(' {year}', '');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
      </main>
      <footer className="bg-primary text-primary-foreground text-center p-4 text-sm">
        {footerText}
      </footer>
      <Toaster />
    </div>
  );
}


export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </SettingsProvider>
  );
}
