
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'VigiaTemp',
  description: 'Monitoramento de temperatura em tempo real para estufas de fermentação.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#14864A" />
      </head>
      <body className="font-body antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
