
'use server';
/**
 * @fileOverview Fluxo de IA para otimizar os limites de temperatura da fermentação de cacau.
 *
 * - optimizeFermentation: Função que invoca o fluxo de IA.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
    OptimizeFermentationInputSchema, 
    OptimizeFermentationOutputSchema,
    type OptimizeFermentationInput,
    type OptimizeFermentationOutput
} from '@/types/ai-schemas';

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
        {{{historicalData}}}
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
    // A transformação para string agora é feita aqui para garantir o formato correto.
    const { output } = await optimizePrompt({
        ...input,
        historicalData: JSON.stringify(JSON.parse(input.historicalData), null, 2),
    });

    if (!output) {
      throw new Error("A IA não conseguiu gerar uma sugestão. Tente refinar suas informações de entrada.");
    }

    return output;
  }
);
