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
      'Historical temperature data for the greenhouse, including timestamps and temperature readings. Should be a JSON array of objects with day and temperature fields, representing daily samples.'
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
  prompt: `Você é um especialista em ciências agrícolas, com especialização na otimização de controles ambientais para o cultivo de cacau.

  Analise os dados históricos de temperatura (amostras diárias), a variedade de cacau e as informações do microclima fornecidas para sugerir limiares de temperatura otimizados para alertas em uma estufa de fermentação.
  **A sua resposta deve ser inteiramente em português.**
  
  Explique seu raciocínio para os limiares sugeridos, considerando as necessidades específicas da variedade de cacau e as características do microclima.

  Dados Históricos: {{{historicalData}}}
  Variedade do Cacau: {{{cacaoVariety}}}
  Informações do Microclima: {{{microclimateInfo}}}
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
