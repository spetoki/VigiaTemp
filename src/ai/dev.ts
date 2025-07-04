import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-alarm-settings';
import '@/ai/flows/get-ambient-temperature';
import '@/ai/tools/weather-tool';
