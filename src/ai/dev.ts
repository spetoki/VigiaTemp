import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-alarm-settings';
// import '@/ai/flows/get-ambient-temperature'; // This flow was converted to a standard server action.
import '@/ai/tools/weather-tool';
