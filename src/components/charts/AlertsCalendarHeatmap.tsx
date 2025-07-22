
"use client";

import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useSettings } from '@/context/SettingsContext';

interface AlertsCalendarHeatmapProps {
  data: { day: string; value: number }[];
}

export default function AlertsCalendarHeatmap({ data }: AlertsCalendarHeatmapProps) {
  const { theme } = useSettings();
  const nivoTheme = {
    textColor: theme === 'dark' ? '#ffffff' : '#000000',
    tooltip: {
      container: {
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#555' : '#ccc',
      },
    },
  };
  
  if (!data || data.length === 0) return null;
  
  const fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const toDate = new Date();

  return (
    <ResponsiveCalendar
      data={data}
      from={fromDate.toISOString().split('T')[0]}
      to={toDate.toISOString().split('T')[0]}
      emptyColor={theme === 'dark' ? 'hsl(var(--muted-foreground)/0.1)' : 'hsl(var(--muted-foreground)/0.1)'}
      colors={[ '#a7f3d0', '#34d399', '#059669', '#d97706', '#b45309' ]} // Greens to Oranges
      margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
      yearSpacing={40}
      monthBorderColor={theme === 'dark' ? '#ffffff' : '#000000'}
      dayBorderWidth={2}
      dayBorderColor={theme === 'dark' ? 'hsl(var(--background))' : '#ffffff'}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'row',
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: 'right-to-left'
        }
      ]}
      theme={nivoTheme}
    />
  );
}
