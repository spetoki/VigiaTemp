
'use server';
/**
 * @fileOverview Fluxo de IA para otimizar os limites de temperatura da fermentação de cacau.
 *
 * - optimizeFermentation: Função que invoca o fluxo de IA.
 * - OptimizeFermentationInput: Tipo de entrada para o fluxo.
 * - OptimizeFermentationOutput: Tipo de saída do fluxo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Esquema de entrada com validação usando Zod
export const OptimizeFermentationInputSchema = z.object({
  cacaoVariety: z.string().describe('A variedade do cacau (ex: Criollo, Forasteiro).'),
  microclimateInfo: z.string().describe('Informações sobre o microclima da estufa (umidade, ventilação, etc.).'),
  historicalData: z.array(z.object({
    timestamp: z.number().describe('O carimbo de data/hora da medição em milissegundos Unix.'),
    temperature: z.number().describe('A temperatura medida em Celsius.'),
  })).describe('Uma série de dados históricos de temperatura.'),
});
export type OptimizeFermentationInput = z.infer<typeof OptimizeFermentationInputSchema>;

// Esquema de saída com validação usando Zod
export const OptimizeFermentationOutputSchema = z.object({
  lowThreshold: z.number().describe('O limite de temperatura inferior ideal sugerido em Celsius.'),
  highThreshold: z.number().describe('O limite de temperatura superior ideal sugerido em Celsius.'),
  explanation: z.string().describe('Uma explicação detalhada do porquê esses limites foram sugeridos, justificando a recomendação com base nos dados fornecidos.'),
});
export type OptimizeFermentationOutput = z.infer<typeof OptimizeFermentationOutputSchema>;


// Função exportada que será chamada pelo componente React
export async function optimizeFermentation(input: OptimizeFermentationInput): Promise<OptimizeFermentationOutput> {
  return await optimizeFermentationFlow(input);
}


// Definição do prompt da IA
const optimizePrompt = ai.definePrompt({
  name: 'optimizeFermentationPrompt',
  input: { schema: OptimizeFermentationInputSchema },
  output: { schema: OptimizeFermentationOutputSchema },
  prompt: `
    Você é um especialista mundial em agronomia e biotecnologia, com foco na fermentação de amêndoas de cacau. Sua tarefa é analisar os dados fornecidos para otimizar os limites de temperatura (mínimo e máximo) para um processo de fermentação.

    Considere os seguintes fatores para sua análise:
    1.  **Variedade do Cacau:** {{cacaoVariety}}. Variedades diferentes têm perfis de fermentação distintos.
    2.  **Microclima:** {{microclimateInfo}}. Condições como umidade alta ou baixa, ventilação e exposição solar influenciam a inércia térmica e o desenvolvimento de leveduras e bactérias.
    3.  **Dados Históricos de Temperatura:** Analise a série de dados a seguir para entender as tendências, picos e vales de temperatura atuais.
        \`\`\`json
        {{{jsonStringify historicalData}}}
        \`\`\`

    Com base em todos esses dados, forneça:
    1.  Um novo \`lowThreshold\` (limite inferior) ideal.
    2.  Um novo \`highThreshold\` (limite superior) ideal.
    3.  Uma \`explanation\` (justificativa) detalhada e técnica, mas de fácil compreensão, explicando por que você está sugerindo esses novos limites. Justifique sua resposta com base nos dados fornecidos, explicando como os novos limites podem melhorar a qualidade da fermentação (ex: "sugiro aumentar o limite máximo para X°C para favorecer a fase acética, crucial para o desenvolvimento de precursores de sabor, já que seus dados históricos mostram que a temperatura raramente atinge este pico...").
  `,
});

// Definição do fluxo Genkit
const optimizeFermentationFlow = ai.defineFlow(
  {
    name: 'optimizeFermentationFlow',
    inputSchema: OptimizeFermentationInputSchema,
    outputSchema: OptimizeFermentationOutputSchema,
  },
  async (input) => {
    const { output } = await optimizePrompt({
        ...input,
        // O Handlebars não consegue acessar diretamente um array de objetos, então o transformamos em string.
        historicalData: JSON.stringify(input.historicalData, null, 2),
    });

    if (!output) {
      throw new Error("A IA não conseguiu gerar uma sugestão. Tente refinar suas informações de entrada.");
    }

    return output;
  }
);
