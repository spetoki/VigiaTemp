
"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Save, Bell, Palette } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAppSettingsPage() {
  const { t } = useSettings();
  const { authState } = useAuth();
  const router = useRouter();

  // States for example settings
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [newUserRegistration, setNewUserRegistration] = React.useState(true);
  const [maxSensorsPerUser, setMaxSensorsPerUser] = React.useState(10);
  const [defaultLanguage, setDefaultLanguage] = React.useState('pt-BR');
  const [enableEmailNotifications, setEnableEmailNotifications] = React.useState(true);

  useEffect(() => {
    if (authState === 'unauthenticated' || authState === 'user') {
      router.push('/login');
    }
  }, [authState, router]);

  const handleSaveChanges = () => {
    // Simulate saving changes
    console.log("Admin settings saved:", { 
      maintenanceMode, 
      newUserRegistration, 
      maxSensorsPerUser,
      defaultLanguage,
      enableEmailNotifications 
    });
  };

  if (authState === 'loading' || authState !== 'admin') {
    return (
      <div className="space-y-8">
        <div className="text-left">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Settings className="mr-3 h-8 w-8" /> 
          {t('admin.appSettingsPage.title', 'Configurações Gerais do Aplicativo')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.appSettingsPage.description', 'Ajuste as configurações globais que afetam todos os usuários e o comportamento do sistema.')}
        </p>
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>{t('admin.appSettings.generalTitle', 'Geral e Acesso')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="maintenance-mode" className="text-base font-semibold">{t('admin.appSettings.maintenanceMode', 'Modo Manutenção')}</Label>
              <p className="text-sm text-muted-foreground">{t('admin.appSettings.maintenanceModeDesc', 'Desativa o acesso ao app para usuários não-administradores.')}</p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              aria-label={t('admin.appSettings.maintenanceMode', 'Modo Manutenção')}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="new-user-registration" className="text-base font-semibold">{t('admin.appSettings.allowRegistration', 'Permitir Novos Cadastros')}</Label>
              <p className="text-sm text-muted-foreground">{t('admin.appSettings.allowRegistrationDesc', 'Controla se novos usuários podem se registrar no sistema.')}</p>
            </div>
            <Switch
              id="new-user-registration"
              checked={newUserRegistration}
              onCheckedChange={setNewUserRegistration}
              aria-label={t('admin.appSettings.allowRegistration', 'Permitir Novos Cadastros')}
            />
          </div>
           <div className="space-y-2 p-4 border rounded-lg">
            <Label htmlFor="default-language" className="text-base font-semibold">{t('admin.appSettings.defaultLanguage', 'Idioma Padrão para Novos Usuários')}</Label>
             <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder={t('admin.appSettings.selectLanguage', "Selecione um idioma")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">{t('language.portuguese', 'Português (Brasil)')}</SelectItem>
                  <SelectItem value="en-US">{t('language.english', 'Inglês (EUA)')}</SelectItem>
                  <SelectItem value="es-ES">{t('language.spanish', 'Espanhol (Espanha)')}</SelectItem>
                </SelectContent>
              </Select>
            <p className="text-sm text-muted-foreground">{t('admin.appSettings.defaultLanguageDesc', 'Define o idioma inicial para usuários recém-registrados.')}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />{t('admin.appSettings.notificationsTitle', 'Notificações')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                <Label htmlFor="enable-email-notifications" className="text-base font-semibold">{t('admin.appSettings.enableEmailNotifications', 'Habilitar Notificações por Email')}</Label>
                <p className="text-sm text-muted-foreground">{t('admin.appSettings.enableEmailNotificationsDesc', 'Permite o envio de notificações por email (ex: alertas de temperatura crítica).')}</p>
                </div>
                <Switch
                id="enable-email-notifications"
                checked={enableEmailNotifications}
                onCheckedChange={setEnableEmailNotifications}
                aria-label={t('admin.appSettings.enableEmailNotifications', 'Habilitar Notificações por Email')}
                />
            </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>{t('admin.appSettings.limitsTitle', 'Limites e Padrões')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 p-4 border rounded-lg">
            <Label htmlFor="max-sensors" className="text-base font-semibold">{t('admin.appSettings.maxSensors', 'Máximo de Sensores por Usuário')}</Label>
            <Input 
              id="max-sensors" 
              type="number" 
              value={maxSensorsPerUser} 
              onChange={(e) => setMaxSensorsPerUser(parseInt(e.target.value, 10) || 0)}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">{t('admin.appSettings.maxSensorsDesc', 'Define o número máximo de sensores que um usuário pode registrar.')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSaveChanges} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {t('admin.appSettings.saveButton', 'Salvar Alterações')}
        </Button>
      </div>
    </div>
  );
}
