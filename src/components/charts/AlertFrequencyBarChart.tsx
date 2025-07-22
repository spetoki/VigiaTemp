
"use client";

import React, { useMemo } from 'react';
import type { Alert } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AlertFrequencyBarChartProps {
  alerts: Alert[];
}

export default function AlertFrequencyBarChart({ alerts }: AlertFrequencyBarChartProps) {
  const { t, language } = useSettings();

  const data = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];
    
    const alertsByDay: Record<string, { critical: number; warning: number }> = {};
    
    // Get the date for 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const filteredAlerts = alerts.filter(alert => new Date(alert.timestamp) >= thirtyDaysAgo);

    filteredAlerts.forEach(alert => {
      const date = new Date(alert.timestamp);
      const day = date.toISOString().split('T')[0];
      if (!alertsByDay[day]) {
        alertsByDay[day] = { critical: 0, warning: 0 };
      }
      alertsByDay[day][alert.level]++;
    });

    return Object.keys(alertsByDay)
      .map(day => ({
        date: day,
        [t('alertsTable.level.critical', 'Crítico')]: alertsByDay[day].critical,
        [t('alertsTable.level.warning', 'Atenção')]: alertsByDay[day].warning,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [alerts, t]);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language, { month: 'short', day: 'numeric' });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
            allowDecimals={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={formatDate}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
            cursor={{ fill: 'hsl(var(--muted-foreground))', opacity: 0.1 }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey={t('alertsTable.level.warning', 'Atenção')} fill="hsl(var(--chart-4))" stackId="a" />
        <Bar dataKey={t('alertsTable.level.critical', 'Crítico')} fill="hsl(var(--chart-1))" stackId="a" radius={[4, 4, 0, 0]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
