import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-alarm-settings.ts';
import '@/ai/flows/get-ambient-temperature.ts';
import '@/ai/tools/weather-tool.ts';
