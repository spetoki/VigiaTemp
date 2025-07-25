
"use client";

import React, { useMemo } from 'react';
import type { Sensor, SensorStatus } from '@/types';
import { getSensorStatus } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SensorStatusPieChartProps {
  sensor: Sensor;
}

const COLORS = {
  normal: 'hsl(var(--chart-2))', // Green
  warning: 'hsl(var(--chart-4))', // Yellow
  critical: 'hsl(var(--chart-1))', // Red
};

// This component now simulates historical data for display purposes,
// as historical data is not stored directly on the sensor object from Firestore.
const generateSimulatedStatusData = (currentStatus: SensorStatus) => {
    const counts: Record<SensorStatus, number> = {
      normal: 0,
      warning: 0,
      critical: 0,
    };
    
    // Create a plausible distribution based on the current status
    if (currentStatus === 'critical') {
        counts.critical = 60;
        counts.warning = 30;
        counts.normal = 10;
    } else if (currentStatus === 'warning') {
        counts.warning = 50;
        counts.normal = 45;
        counts.critical = 5;
    } else { // normal
        counts.normal = 90;
        counts.warning = 9;
        counts.critical = 1;
    }
    
    return counts;
};


export default function SensorStatusPieChart({ sensor }: SensorStatusPieChartProps) {
  const { t } = useSettings();

  const statusData = useMemo(() => {
    const currentStatus = getSensorStatus(sensor);
    const counts = generateSimulatedStatusData(currentStatus);

    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      return [];
    }

    const statusMap = {
      normal: t('dataAnalysis.pieChart.statusNormal', 'Normal'),
      warning: t('dataAnalysis.pieChart.statusWarning', 'Atenção'),
      critical: t('dataAnalysis.pieChart.statusCritical', 'Crítico'),
    };

    return (Object.keys(counts) as SensorStatus[])
      .map(key => ({
        name: statusMap[key],
        value: counts[key],
        percentage: ((counts[key] / total) * 100).toFixed(1),
        color: COLORS[key],
      }))
      .filter(item => item.value > 0);
  }, [sensor, t]);

  if (statusData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base truncate">{sensor.name}</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">{t('dataAnalysis.noData', 'Sem dados históricos')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base truncate" title={sensor.name}>{sensor.name}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => [`${props.payload.percentage}%`, name]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
