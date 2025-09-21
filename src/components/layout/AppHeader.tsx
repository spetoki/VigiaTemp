
"use client";

import Link from 'next/link';
import { ThermometerSnowflake, Home, Settings, BrainCircuit, Menu, LineChart, SlidersHorizontal, Bell, Wrench, ClipboardList, Activity, LogOut, Usb, FileCode2, Puzzle, Info, Warehouse } from 'lucide-react';
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

const NavLink = ({ href, labelKey, icon: Icon, defaultLabel, isMobile, className }: {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  defaultLabel: string;
  isMobile?: boolean;
  className?: string;
}) => {
  const { t } = useSettings();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false); // Local state for mobile menu link clicks

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

  // Dashboard link is now handled separately
  const mainNavItems = [
    { href: '/alerts', labelKey: 'nav.alerts', icon: Bell, defaultLabel: 'Alertas' },
    { href: '/sensors', labelKey: 'nav.sensors', icon: Settings, defaultLabel: 'Sensores' },
    { href: '/sensor-charts', labelKey: 'nav.sensorCharts', icon: LineChart, defaultLabel: 'Gráficos' },
    { href: '/data-analysis', labelKey: 'nav.dataAnalysis', icon: Activity, defaultLabel: 'Análise de Dados' },
    { href: '/traceability', labelKey: 'nav.traceability', icon: ClipboardList, defaultLabel: 'Rastreabilidade' },
    { href: '/stock-control', labelKey: 'nav.stockControl', icon: Warehouse, defaultLabel: 'Estoque' },
    { href: '/optimize-alarms', labelKey: 'nav.optimizeAlarms', icon: BrainCircuit, defaultLabel: 'Otimizar Alarmes' },
  ];

  const hardwareNavItems = [
    { href: '/hardware-assembly', labelKey: 'nav.hardwareAssembly', icon: Wrench, defaultLabel: 'Montagem' },
    { href: '/device-configurator', labelKey: 'nav.deviceConfigurator', icon: FileCode2, defaultLabel: 'Configurar Dispositivo' },
  ];

  const appInfoNavItems = [
      { href: '/about', labelKey: 'nav.about', icon: Info, defaultLabel: 'Sobre o App' },
  ]

  const settingsAndLogout = [
     { href: '/system-settings', labelKey: 'nav.systemSettings', icon: SlidersHorizontal, defaultLabel: 'Configurações' },
  ];
  
  const MobileNavLink = ({ href, labelKey, icon: Icon, defaultLabel }: {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    defaultLabel: string;
  }) => (
     <NavLink 
      href={href}
      labelKey={labelKey}
      icon={Icon}
      defaultLabel={defaultLabel}
      isMobile
      className="text-base w-full justify-start"
     />
  );
  
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
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">App</p>
                      {appInfoNavItems.map(item => <MobileNavLink key={item.href} {...item} />)}
                    </div>
                    <Separator />
                    <div className="flex flex-col space-y-1">
                       {settingsAndLogout.map(item => <MobileNavLink key={item.href} {...item} />)}
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
