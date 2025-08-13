
"use client";

import Link from 'next/link';
import { ThermometerSnowflake, Home, Settings, BrainCircuit, Menu, LineChart, SlidersHorizontal, Bell, Wrench, ClipboardList, Activity, LogOut, Usb, FileCode2, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/context/SettingsContext';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
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
import { Separator } from '../ui/separator';

export default function AppHeader() {
  const { temperatureUnit, setTemperatureUnit, t, lockApp } = useSettings();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const mainNavItems = [
    { href: '/', labelKey: 'nav.dashboard', icon: Home, defaultLabel: 'Painel' },
    { href: '/alerts', labelKey: 'nav.alerts', icon: Bell, defaultLabel: 'Alertas' },
    { href: '/sensors', labelKey: 'nav.sensors', icon: Settings, defaultLabel: 'Sensores' },
    { href: '/sensor-charts', labelKey: 'nav.sensorCharts', icon: LineChart, defaultLabel: 'Gráficos' },
    { href: '/data-analysis', labelKey: 'nav.dataAnalysis', icon: Activity, defaultLabel: 'Análise de Dados' },
    { href: '/traceability', labelKey: 'nav.traceability', icon: ClipboardList, defaultLabel: 'Rastreabilidade' },
    { href: '/optimize-alarms', labelKey: 'nav.optimizeAlarms', icon: BrainCircuit, defaultLabel: 'Otimizar Alarmes' },
  ];

  const hardwareNavItems = [
    { href: '/hardware-assembly', labelKey: 'nav.hardwareAssembly', icon: Wrench, defaultLabel: 'Montagem' },
    { href: '/device-configurator', labelKey: 'nav.deviceConfigurator', icon: FileCode2, defaultLabel: 'Configurar Dispositivo' },
    { href: '/web-flasher', labelKey: 'nav.webFlasher', icon: Usb, defaultLabel: 'Instalador Web' },
    { href: '/esphome', labelKey: 'nav.esphome', icon: Puzzle, defaultLabel: 'Configurador ESPHome' },
  ];

  const settingsAndLogout = [
     { href: '/system-settings', labelKey: 'nav.systemSettings', icon: SlidersHorizontal, defaultLabel: 'Configurações' },
  ];
  
  const NavLink = ({ href, labelKey, icon: Icon, defaultLabel, isMobile }: {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    defaultLabel: string;
    isMobile?: boolean;
  }) => {
    return (
      <Link
        href={href}
        onClick={() => {
          if (isMobile && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname === href
            ? "bg-primary/10 text-primary"
            : "text-foreground/70 hover:text-foreground hover:bg-primary/5",
          isMobile && "text-base w-full justify-start"
        )}
        aria-current={pathname === href ? "page" : undefined}
      >
        <Icon className="h-5 w-5" />
        {t(labelKey, defaultLabel)}
      </Link>
    );
  }

  const LogoutButton = ({ isMobile }: { isMobile?: boolean }) => (
     <AlertDialog>
        <AlertDialogTrigger asChild>
           <button className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/70 hover:text-foreground hover:bg-destructive/10",
                 isMobile && "text-base w-full justify-start"
            )}>
              <LogOut className="h-5 w-5" />
              {t('nav.logout', 'Sair')}
            </button>
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
                <AlertDialogAction onClick={lockApp} className="bg-destructive hover:bg-destructive/90">
                    {t('nav.logout', 'Sair')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  const MobileNavMenu = () => (
     <div className="md:hidden">
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
                      {mainNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('nav.hardwareMenu', 'Hardware')}</p>
                      {hardwareNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                       {settingsAndLogout.map(item => <NavLink key={item.href} {...item} isMobile />)}
                      <LogoutButton isMobile />
                    </div>
                </div>
          </SheetContent>
        </Sheet>
      </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ThermometerSnowflake className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">VigiaTemp</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {mainNavItems.map(item => <NavLink key={item.href} {...item} />)}
          <Separator orientation="vertical" className="h-6" />
          {hardwareNavItems.map(item => <NavLink key={item.href} {...item} />)}
           <Separator orientation="vertical" className="h-6" />
          {settingsAndLogout.map(item => <NavLink key={item.href} {...item} />)}
        </nav>

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

            <div className="hidden md:block">
              <LogoutButton />
            </div>
          
            <MobileNavMenu />
        </div>
      </div>
    </header>
  );
}
