
"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Settings, LayoutPanelLeft } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { t } = useSettings();
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState === 'unauthenticated' || authState === 'user') {
      router.push('/login');
    }
  }, [authState, router]);
  
  if (authState === 'loading' || authState !== 'admin') {
     return (
        <div className="space-y-8">
            <div className="text-left">
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <LayoutPanelLeft className="mr-3 h-8 w-8" /> 
          {t('admin.dashboard.title', 'Painel de Administração')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.dashboard.description', 'Bem-vindo à área de administração. Gerencie usuários e configurações do aplicativo.')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {t('admin.manageUsers.title', 'Gerenciar Usuários')}</CardTitle>
            <CardDescription>{t('admin.manageUsers.description', 'Visualize, edite e gerencie contas de usuário.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">{t('admin.manageUsers.button', 'Ir para Usuários')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> {t('admin.appSettings.title', 'Configurações do Aplicativo')}</CardTitle>
            <CardDescription>{t('admin.appSettings.description', 'Ajuste as configurações globais do aplicativo.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/app-settings">{t('admin.appSettings.button', 'Ir para Configurações')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
