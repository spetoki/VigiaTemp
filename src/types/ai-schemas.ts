
import { z } from 'zod';

// Esquema de entrada com validação usando Zod
export const OptimizeFermentationInputSchema = z.object({
  cacaoVariety: z.string().min(3, "A variedade do cacau é obrigatória."),
  microclimateInfo: z.string().min(20, "A descrição do microclima é obrigatória (mín. 20 caracteres)."),
  // O componente do formulário irá fornecer uma string JSON, então validamos isso aqui.
  // O fluxo do servidor irá fazer o parse.
  historicalData: z.string().refine((data) => {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed); // Verificação básica se é um array
    } catch (e) {
      return false;
    }
  }, "Os dados históricos são obrigatórios e devem ser um JSON válido."),
});
export type OptimizeFermentationInput = z.infer<typeof OptimizeFermentationInputSchema>;

// Esquema de saída com validação usando Zod
export const OptimizeFermentationOutputSchema = z.object({
  lowThreshold: z.number().describe('O limite de temperatura inferior ideal sugerido em Celsius.'),
  highThreshold: z.number().describe('O limite de temperatura superior ideal sugerido em Celsius.'),
  explanation: z.string().describe('Uma explicação detalhada do porquê esses limites foram sugeridos, justificando a recomendação com base nos dados fornecidos.'),
});
export type OptimizeFermentationOutput = z.infer<typeof OptimizeFermentationOutputSchema>;

    