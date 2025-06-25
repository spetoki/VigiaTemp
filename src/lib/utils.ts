import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Sensor, SensorStatus, TemperatureUnit } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertTemperature(temperature: number, toUnit: TemperatureUnit, fromUnit: TemperatureUnit = 'C'): number {
  if (fromUnit === toUnit) {
    return temperature;
  }
  if (toUnit === 'F') {
    // Convert from Celsius to Fahrenheit
    return (temperature * 9/5) + 32;
  } else {
    // Convert from Fahrenheit to Celsius
    return (temperature - 32) * 5/9;
  }
}

export function getSensorStatus(sensor: Sensor): SensorStatus {
  if (sensor.currentTemperature > sensor.highThreshold || sensor.currentTemperature < sensor.lowThreshold) {
    return 'critical';
  }
  // Example warning: if temperature is within 10% of the threshold range
  const upperWarning = sensor.highThreshold - (sensor.highThreshold - sensor.lowThreshold) * 0.1;
  const lowerWarning = sensor.lowThreshold + (sensor.highThreshold - sensor.lowThreshold) * 0.1;

  if (sensor.currentTemperature > upperWarning || sensor.currentTemperature < lowerWarning) {
    // ensure warning is not triggered if it's already critical
    if (sensor.currentTemperature <= sensor.highThreshold && sensor.currentTemperature >= sensor.lowThreshold) {
       return 'warning';
    }
  }
  return 'normal';
}

export function formatTemperature(temperature: number, unit: TemperatureUnit, storedUnit: TemperatureUnit = 'C'): string {
  const displayTemp = convertTemperature(temperature, unit, storedUnit);
  return `${displayTemp.toFixed(1)}°${unit}`;
}
