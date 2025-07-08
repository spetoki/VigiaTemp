
"use client";

import Link from 'next/link';
import { ThermometerSnowflake, Home, Settings, BrainCircuit, Menu, LineChart, User, SlidersHorizontal, LayoutPanelLeft, Bell, Bluetooth, Wifi, Wrench, ClipboardList, LogIn, LogOut, Cog } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/context/SettingsContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';

export default function AppHeader() {
  const { temperatureUnit, setTemperatureUnit, t } = useSettings();
  const pathname = usePathname();
  const { authState, currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const mainNavItems = [
    { href: '/', labelKey: 'nav.dashboard', icon: Home, defaultLabel: 'Painel' },
    { href: '/alerts', labelKey: 'nav.alerts', icon: Bell, defaultLabel: 'Alertas' },
    { href: '/sensors', labelKey: 'nav.sensors', icon: Settings, defaultLabel: 'Sensores' },
    { href: '/traceability', labelKey: 'nav.traceability', icon: ClipboardList, defaultLabel: 'Rastreabilidade' },
    { href: '/optimize-alarms', labelKey: 'nav.optimizeAlarms', icon: BrainCircuit, defaultLabel: 'Otimizar Alarmes' },
    { href: '/sensor-charts', labelKey: 'nav.sensorCharts', icon: LineChart, defaultLabel: 'Gráficos dos Sensores' },
    { href: '/hardware-assembly', labelKey: 'nav.hardwareAssembly', icon: Wrench, defaultLabel: 'Montagem' },
    { href: '/device-configurator', labelKey: 'nav.deviceConfigurator', icon: Cog, defaultLabel: 'Configurar Dispositivo' },
  ];

  const userNavItems = [
    { href: '/user-profile', labelKey: 'nav.userProfile', icon: User, defaultLabel: 'Painel do Usuário' },
    { href: '/system-settings', labelKey: 'nav.systemSettings', icon: SlidersHorizontal, defaultLabel: 'Configurações' },
  ];
  
  const adminNavItems = [
    { href: '/admin', labelKey: 'nav.adminPanel', icon: LayoutPanelLeft, defaultLabel: 'Painel Admin' },
  ];

  const NavLink = ({ href, labelKey, icon: Icon, defaultLabel, isMobile }: {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    defaultLabel: string;
    isMobile?: boolean;
  }) => (
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

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userNavItems.map(item => (
            <Link href={item.href} passHref key={item.href}>
              <DropdownMenuItem className="cursor-pointer">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{t(item.labelKey, item.defaultLabel)}</span>
              </DropdownMenuItem>
            </Link>
          ))}
          {currentUser?.role === 'Admin' && adminNavItems.map(item => (
            <Link href={item.href} passHref key={item.href}>
              <DropdownMenuItem className="cursor-pointer">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{t(item.labelKey, item.defaultLabel)}</span>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
              {authState === 'authenticated' ? (
                <>
                  <div className="flex-grow overflow-y-auto p-4">
                      <div className="flex flex-col space-y-2">
                        {mainNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                        <Separator className="my-2" />
                        <span className="px-3 py-2 text-sm font-semibold text-muted-foreground">{t('nav.userMenu', 'Usuário')}</span>
                        {userNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}

                        {currentUser?.role === 'Admin' && (
                          <>
                            <Separator className="my-2" />
                            <span className="px-3 py-2 text-sm font-semibold text-muted-foreground">{t('nav.adminMenu', 'Administração')}</span>
                            {adminNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                          </>
                        )}
                      </div>
                  </div>
                  <SheetFooter className="p-4 border-t">
                      <Button variant="outline" className="w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('nav.logout', 'Sair')}
                      </Button>
                  </SheetFooter>
                </>
              ) : (
                <div className="flex-grow flex flex-col justify-center items-center gap-4 p-4">
                    <SheetClose asChild>
                        <Link href="/login" className={cn(buttonVariants({variant: 'default', size: 'lg'}), 'w-full')}>
                            <LogIn className="mr-2 h-5 w-5" /> {t('nav.login', 'Login')}
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/signup" className={cn(buttonVariants({variant: 'secondary', size: 'lg'}), 'w-full')}>
                            {t('signup.signUpLink', 'Sign up')}
                        </Link>
                    </SheetClose>
                </div>
              )}
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
        
        {authState === 'authenticated' && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {mainNavItems.map(item => <NavLink key={item.href} {...item} />)}
          </nav>
        )}

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

          {authState === 'authenticated' ? (
             <div className="hidden md:flex items-center gap-x-2">
                <UserMenu />
                 <Button variant="ghost" size="icon" onClick={logout} aria-label={t('nav.logout', 'Sair do app')}>
                    <LogOut className="h-5 w-5" />
                </Button>
              </div>
          ) : authState === 'unauthenticated' ? (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">{t('nav.login', 'Login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t('signup.signUpLink', 'Sign up')}</Link>
              </Button>
            </div>
          ) : null }
          
          <MobileNavMenu />
        </div>
      </div>
    </header>
  );
}
