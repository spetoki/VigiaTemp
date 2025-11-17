"use client";

import type { Sensor, SensorStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, AlertTriangle, CheckCircle2, MapPin, WifiOff, ArrowDown, ArrowUp, RotateCw, AlignVerticalSpaceAround, ArrowDownToDot, ArrowUpToDot } from 'lucide-react';
import { cn, formatTemperature } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { Badge } from '@/components/ui/badge';
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
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { resetMinMaxTemperatures } from '@/services/sensor-service';
import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GreenhouseCardProps {
  greenhouseName: string;
  sensors: {
    low: Sensor | undefined;
    middle: Sensor | undefined;
    high: Sensor | undefined;
  };
  onUpdate: () => void;
}

export default function GreenhouseCard({ greenhouseName, sensors, onUpdate }: GreenhouseCardProps) {
  const { temperatureUnit, t, storageKeys } = useSettings();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const validSensors = Object.values(sensors).filter((s): s is Sensor => !!s);
  if (validSensors.length === 0) return null;

  const getOverallStatus = (): SensorStatus => {
    let hasOffline = false;
    let hasCritical = false;
    let hasWarning = false;
    
    for (const sensor of validSensors) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (!sensor.lastUpdatedAt || sensor.lastUpdatedAt < fiveMinutesAgo) {
            hasOffline = true;
            continue; // Don't check temp if offline
        }
        if (sensor.currentTemperature > sensor.highThreshold || sensor.currentTemperature < sensor.lowThreshold) {
            hasCritical = true;
        }
        const upperWarning = sensor.highThreshold - (sensor.highThreshold - sensor.lowThreshold) * 0.1;
        const lowerWarning = sensor.lowThreshold + (sensor.highThreshold - sensor.lowThreshold) * 0.1;

        if (sensor.currentTemperature > upperWarning || sensor.currentTemperature < lowerWarning) {
            hasWarning = true;
        }
    }
    
    if (hasCritical) return 'critical';
    if (hasOffline) return 'offline';
    if (hasWarning) return 'warning';
    return 'normal';
  };

  const status = getOverallStatus();
  
  const averageTemperature = validSensors.reduce((acc, s) => acc + s.currentTemperature, 0) / validSensors.length;
  
  // Use a location from any of the valid sensors
  const location = validSensors[0]?.location || 'Localização Múltipla';

  const statusConfig: Record<SensorStatus, { icon: React.ElementType; colorClass: string; label: string; cardClass?: string; }> = {
    normal: { icon: CheckCircle2, colorClass: 'text-green-600', label: t('sensorCard.label.normal', 'Normal') },
    warning: { icon: AlertTriangle, colorClass: 'text-yellow-500', label: t('sensorCard.label.warning', 'Atenção'), cardClass: 'border-yellow-500' },
    critical: { icon: AlertTriangle, colorClass: 'text-destructive-foreground', label: t('sensorCard.label.critical', 'Crítico'), cardClass: 'bg-destructive text-destructive-foreground animate-flash-bg' },
    offline: { icon: WifiOff, colorClass: 'text-muted-foreground', label: t('sensorCard.label.offline', 'Offline'), cardClass: 'bg-muted/50 border-dashed' },
  };
  
  const config = statusConfig[status];

  const handleReset = async () => {
    setIsResetting(true);
    try {
        if (!storageKeys.sensors) throw new Error("Caminho da coleção inválido.");
        
        await Promise.all(validSensors.map(s => resetMinMaxTemperatures(storageKeys.sensors, s.id)));
        
        toast({
            title: "Registros Zerados",
            description: `As temperaturas mínimas e máximas dos sensores da estufa ${greenhouseName} foram redefinidas.`,
        });
        onUpdate();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Zerar",
            description: "Não foi possível redefinir os registros de temperatura.",
        });
    } finally {
        setIsResetting(false);
    }
  };

  const SensorTempDisplay = ({ sensor, label, icon: Icon }: { sensor: Sensor | undefined, label: string, icon: React.ElementType }) => {
    if (!sensor) return <div className="text-sm text-muted-foreground/50">{label}: N/A</div>;
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-foreground/5 transition-colors">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </div>
                        <span className="font-bold text-lg">{formatTemperature(sensor.currentTemperature, temperatureUnit)}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Mín: {formatTemperature(sensor.lowThreshold, temperatureUnit)} / Máx: {formatTemperature(sensor.highThreshold, temperatureUnit)}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
  };

  return (
    <Card className={cn(
      "shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group",
      config.cardClass || "border-gray-200"
    )}>
       <AlertDialog>
        <CardHeader className="pb-2 relative">
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-headline">{greenhouseName}</CardTitle>
                <Badge variant={status === 'critical' ? 'default' : status === 'warning' ? 'default' : 'secondary'} 
                    className={cn(
                        status === 'warning' && 'bg-yellow-500 text-white', 
                        status === 'critical' && 'bg-destructive-foreground/20 text-destructive-foreground border-destructive-foreground/50',
                        status === 'offline' && 'bg-gray-500 text-white'
                    )}>
                    <config.icon className={cn("mr-1 h-4 w-4", 
                        status === 'normal' ? 'text-green-600' :
                        status === 'warning' ? 'text-white' :
                        status === 'critical' ? 'text-destructive-foreground' :
                        'text-white'
                    )} />
                    {config.label}
                </Badge>
            </div>
            <CardDescription className={cn("flex items-center text-sm", status === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>
                <MapPin className="h-4 w-4 mr-1" /> {location}
            </CardDescription>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-center my-4 gap-2">
            { status !== 'offline' ? (
                <>
                    <Thermometer className={cn("h-16 w-16", config.colorClass)} />
                    <div>
                        <p className={cn("text-5xl font-bold", config.colorClass)}>
                            {formatTemperature(averageTemperature, temperatureUnit)}
                        </p>
                        <p className={cn("text-xs text-center -mt-1", status === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>Média</p>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-[88px] text-muted-foreground">
                    <WifiOff className="h-12 w-12" />
                    <p className="mt-2 text-sm font-medium">Um ou mais sensores sem sinal</p>
                </div>
            )}
            </div>

            <Separator className="my-3"/>
            
            <div className="grid grid-cols-3 divide-x">
                <SensorTempDisplay sensor={sensors.low} label="Baixo" icon={ArrowDownToDot} />
                <SensorTempDisplay sensor={sensors.middle} label="Meio" icon={AlignVerticalSpaceAround} />
                <SensorTempDisplay sensor={sensors.high} label="Alto" icon={ArrowUpToDot} />
            </div>
        </CardContent>
         <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Zerar Registros de Temperatura?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação redefinirá a temperatura mínima e máxima registradas para todos os sensores da estufa "{greenhouseName}". Isso não pode ser desfeito.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={isResetting}>
                        {isResetting ? "Redefinindo..." : "Zerar Registros"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
