
// Este arquivo não é mais necessário para simulação em tempo real,
// pois os dados agora são buscados diretamente do Firestore.
// Manterei a estrutura caso seja útil para testes futuros.

import type { Sensor, HistoricalDataPoint } from '@/types';

// Função de simulação, pode ser removida ou adaptada se não for mais usada.
export const simulateTemperatureUpdate = (sensor: { currentTemperature: number, name: string }): number => {
  const currentTemp = sensor.currentTemperature;

  // Manter uma flutuação mínima para evitar estagnação completa se ainda for usada em algum lugar.
  const change = (Math.random() - 0.5) * 0.2; 
  return parseFloat((currentTemp + change).toFixed(1));
};
