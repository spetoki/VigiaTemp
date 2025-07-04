
"use client";

import Link from 'next/link';
import { ThermometerSnowflake, Home, Settings, BrainCircuit, Menu, LineChart, User, SlidersHorizontal, LayoutPanelLeft, Bell, Bluetooth, Wifi, Wrench, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/context/SettingsContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AppHeader() {
  const { temperatureUnit, setTemperatureUnit, t } = useSettings();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const mainNavItems = [
    { href: '/', labelKey: 'nav.dashboard', icon: Home, defaultLabel: 'Painel' },
    { href: '/alerts', labelKey: 'nav.alerts', icon: Bell, defaultLabel: 'Alertas' },
    { href: '/sensors', labelKey: 'nav.sensors', icon: Settings, defaultLabel: 'Sensores' },
    { href: '/traceability', labelKey: 'nav.traceability', icon: ClipboardList, defaultLabel: 'Rastreabilidade' },
    { href: '/optimize-alarms', labelKey: 'nav.optimizeAlarms', icon: BrainCircuit, defaultLabel: 'Otimizar Alarmes' },
    { href: '/sensor-charts', labelKey: 'nav.sensorCharts', icon: LineChart, defaultLabel: 'Gráficos dos Sensores' },
    { href: '/wifi-discovery', labelKey: 'nav.wifiDiscovery', icon: Wifi, defaultLabel: 'Descoberta WiFi' },
    { href: '/bluetooth-discovery', labelKey: 'nav.bluetoothDiscovery', icon: Bluetooth, defaultLabel: 'Descoberta Bluetooth' },
    { href: '/hardware-assembly', labelKey: 'nav.hardwareAssembly', icon: Wrench, defaultLabel: 'Montagem' },
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
        isMobile && "text-lg w-full justify-start"
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
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin</p>
            <p className="text-xs leading-none text-muted-foreground">admin@vigiatemp.com</p>
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
          {adminNavItems.map(item => (
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


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ThermometerSnowflake className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">VigiaTemp</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {mainNavItems.map(item => <NavLink key={item.href} {...item} />)}
        </nav>

        <div className="flex items-center gap-4">
          <RadioGroup
            value={temperatureUnit}
            onValueChange={(value) => setTemperatureUnit(value as 'C' | 'F')}
            className="flex items-center space-x-2"
            aria-label={t('temperatureUnitSelection', 'Seleção de unidade de temperatura')}
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="C" id="unit-c" />
              <Label htmlFor="unit-c" className="cursor-pointer">°C</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="F" id="unit-f" />
              <Label htmlFor="unit-f" className="cursor-pointer">°F</Label>
            </div>
          </RadioGroup>
          
          <div className="hidden md:block">
            <UserMenu />
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t('openMenu', 'Abrir menu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[300px] p-6 flex flex-col">
                 <SheetHeader className="text-left">
                    <SheetTitle>{t('nav.mainMenu', 'Menu Principal')}</SheetTitle>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4">
                    <div className="flex flex-col space-y-2">
                      {mainNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                      <hr className="my-2"/>
                      <span className="px-3 py-2 text-sm font-semibold text-muted-foreground">{t('nav.userMenu', 'Usuário')}</span>
                      {userNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}

                      <hr className="my-2"/>
                      <span className="px-3 py-2 text-sm font-semibold text-muted-foreground">{t('nav.adminMenu', 'Administração')}</span>
                      {adminNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">{t('nav.closeMenu', 'Fechar Menu')}</Button>
                    </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
