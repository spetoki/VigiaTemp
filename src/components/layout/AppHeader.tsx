
"use client";

import Link from 'next/link';
import { ThermometerSnowflake, Home, Settings, BrainCircuit, Menu, LineChart, SlidersHorizontal, Bell, Wrench, ClipboardList, Activity, Info, FileCode2, Users, LogOut, Building2, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/context/SettingsContext';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const NavLink = ({ href, labelKey, icon: Icon, defaultLabel, isMobile, className, onClick }: {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  defaultLabel: string;
  isMobile?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  const { t } = useSettings();
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === href
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:text-foreground hover:bg-primary/5",
        isMobile && "text-base w-full justify-start",
        className
      )}
      aria-current={pathname === href ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span>{t(labelKey, defaultLabel)}</span>
    </Link>
  );
}

export default function AppHeader() {
  const { temperatureUnit, setTemperatureUnit, t, lockApp } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const mainNavItems = [
    { href: '/alerts', labelKey: 'nav.alerts', icon: Bell, defaultLabel: 'Alertas' },
    { href: '/sensors', labelKey: 'nav.sensors', icon: Settings, defaultLabel: 'Sensores' },
    { href: '/sensor-charts', labelKey: 'nav.sensorCharts', icon: LineChart, defaultLabel: 'Gráficos' },
    { href: '/data-analysis', labelKey: 'nav.dataAnalysis', icon: Activity, defaultLabel: 'Análise de Dados' },
    { href: '/traceability', labelKey: 'nav.traceability', icon: ClipboardList, defaultLabel: 'Rastreabilidade' },
  ];

  const hardwareNavItems = [
    { href: '/hardware-assembly', labelKey: 'nav.hardwareAssembly', icon: Wrench, defaultLabel: 'Montagem' },
    { href: '/device-configurator', labelKey: 'nav.deviceConfigurator', icon: FileCode2, defaultLabel: 'Configurar Dispositivo' },
  ];
  
  const adminNavItems = [
      { href: '/admin/users', labelKey: 'nav.users', icon: Users, defaultLabel: 'Usuários' },
  ];

  const appInfoNavItems = [
      { href: '/about', labelKey: 'nav.about', icon: Info, defaultLabel: 'Sobre o App' },
      { href: '/who-we-are', labelKey: 'nav.whoWeAre', icon: Building2, defaultLabel: 'Quem Somos' },
      { href: '/hardware-usage', labelKey: 'nav.hardwareUsage', icon: AlertTriangle, defaultLabel: 'Uso do Hardware' },
      { href: '/privacy-policy', labelKey: 'nav.privacyPolicy', icon: ShieldCheck, defaultLabel: 'Política de Privacidade' },
  ];

  const settingsItems = [
     { href: '/system-settings', labelKey: 'nav.systemSettings', icon: SlidersHorizontal, defaultLabel: 'Configurações' },
  ];
  
  const MobileNavLink = (props: React.ComponentProps<typeof NavLink>) => (
     <NavLink 
      {...props}
      isMobile
      onClick={() => setIsMobileMenuOpen(false)}
      className="text-base w-full justify-start"
     />
  );
  
  const NavMenu = () => (
     <div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{t('openMenu', 'Abrir menu')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-[300px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">{t('nav.mainMenu', 'Menu Principal')}</SheetTitle>
              </SheetHeader>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="flex flex-col space-y-1">
                      {mainNavItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('nav.hardwareMenu', 'Hardware')}</p>
                      {hardwareNavItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                     <Separator />
                    <div className="flex flex-col space-y-1">
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('nav.adminMenu', 'Administração')}</p>
                      {adminNavItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">App</p>
                      {appInfoNavItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                       {settingsItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                </div>
                 <SheetFooter className="p-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <LogOut className="mr-2 h-5 w-5" />
                          {t('nav.logout', 'Sair')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('logoutDialog.title', 'Confirmar Saída')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('logoutDialog.description', 'Tem certeza de que deseja sair? Isso irá bloquear o aplicativo e você precisará inserir uma chave de acesso para entrar novamente.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('logoutDialog.cancel', 'Cancelar')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            lockApp();
                            setIsMobileMenuOpen(false);
                          }}>
                            {t('nav.logout', 'Sair')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ThermometerSnowflake className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary font-headline hidden sm:inline">VigiaTemp</span>
          </Link>
          <Separator orientation="vertical" className="h-8 hidden sm:block"/>
           <div className="hidden sm:flex">
             <NavLink 
                href="/"
                labelKey='nav.dashboard'
                icon={Home}
                defaultLabel='Painel'
             />
           </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
            <RadioGroup
              value={temperatureUnit}
              onValueChange={(value) => setTemperatureUnit(value as 'C' | 'F')}
              className="hidden sm:flex items-center space-x-2"
              aria-label={t('temperatureUnitSelection', 'Seleção de unidade de temperatura')}
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="C" id="unit-c-desktop" />
                <Label htmlFor="unit-c-desktop" className="cursor-pointer">°C</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="F" id="unit-f-desktop" />
                <Label htmlFor="unit-f-desktop" className="cursor-pointer">°F</Label>
              </div>
            </RadioGroup>
          
            <NavMenu />
        </div>
      </div>
    </header>
  );
}
