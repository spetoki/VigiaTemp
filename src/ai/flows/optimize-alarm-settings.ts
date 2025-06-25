// optimize-alarm-settings.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing temperature alarm settings in fermentation greenhouses.
 *
 * - optimizeAlarmSettings - The main function to trigger the alarm optimization flow.
 * - OptimizeAlarmSettingsInput - The input type for the optimizeAlarmSettings function.
 * - OptimizeAlarmSettingsOutput - The output type for the optimizeAlarmSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeAlarmSettingsInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical temperature data for the greenhouse, including timestamps and temperature readings. Should be a JSON array of objects with timestamp and temperature fields.'
    ),
  cacaoVariety: z.string().describe('The specific variety of cacao being cultivated.'),
  microclimateInfo: z
    .string()
    .describe('Detailed information about the greenhouse microclimate, including humidity, sunlight exposure, and ventilation.'),
});
export type OptimizeAlarmSettingsInput = z.infer<typeof OptimizeAlarmSettingsInputSchema>;

const OptimizeAlarmSettingsOutputSchema = z.object({
  optimalThresholds: z.object({
    highTemperatureThreshold: z
      .number()
      .describe('The optimized high temperature threshold for triggering alerts.'),
    lowTemperatureThreshold: z
      .number()
      .describe('The optimized low temperature threshold for triggering alerts.'),
  }),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of why these thresholds are recommended, considering the input data.'
    ),
});
export type OptimizeAlarmSettingsOutput = z.infer<typeof OptimizeAlarmSettingsOutputSchema>;

export async function optimizeAlarmSettings(input: OptimizeAlarmSettingsInput): Promise<OptimizeAlarmSettingsOutput> {
  return optimizeAlarmSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeAlarmSettingsPrompt',
  input: {schema: OptimizeAlarmSettingsInputSchema},
  output: {schema: OptimizeAlarmSettingsOutputSchema},
  prompt: `You are an expert in agricultural science, specializing in optimizing environmental controls for cacao cultivation.

  Analyze the provided historical temperature data, cacao variety, and microclimate information to suggest optimized temperature thresholds for alerts in a fermentation greenhouse.
  Explain your reasoning for the suggested thresholds, considering the specific needs of the cacao variety and the characteristics of the microclimate.

  Historical Data: {{{historicalData}}}
  Cacao Variety: {{{cacaoVariety}}}
  Microclimate Information: {{{microclimateInfo}}}
  `,
});

const optimizeAlarmSettingsFlow = ai.defineFlow(
  {
    name: 'optimizeAlarmSettingsFlow',
    inputSchema: OptimizeAlarmSettingsInputSchema,
    outputSchema: OptimizeAlarmSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
