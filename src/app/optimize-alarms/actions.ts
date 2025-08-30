
"use server";

import { optimizeAlarmSettings, OptimizeAlarmSettingsInput, OptimizeAlarmSettingsOutput } from '@/ai/flows/optimize-alarm-settings';
import { z } from 'zod';

const OptimizeAlarmSettingsFormSchema = z.object({
  historicalData: z.string().min(1, 'Os dados históricos são obrigatórios.'),
  cacaoVariety: z.string().min(1, 'A variedade de cacau é obrigatória.'),
  microclimateInfo: z.string().min(1, 'As informações do microclima são obrigatórias.'),
});

// Simplified state for client-side handling
export type OptimizeFormState = {
  message: string;
  issues?: string[];
  data?: OptimizeAlarmSettingsOutput;
  success: boolean;
};

export async function handleOptimizeAlarms(
  formData: OptimizeAlarmSettingsInput
): Promise<OptimizeFormState> {
  
  const validatedFields = OptimizeAlarmSettingsFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const allIssues: string[] = [
        ...(fieldErrors.historicalData || []),
        ...(fieldErrors.cacaoVariety || []),
        ...(fieldErrors.microclimateInfo || [])
    ].filter(Boolean); // Filter out any empty arrays
    
    return {
      message: "A validação do formulário falhou. Verifique os campos.",
      issues: allIssues,
      success: false,
    };
  }
  
  try {
    const result = await optimizeAlarmSettings(validatedFields.data);
    return { message: "Otimização bem-sucedida!", data: result, success: true };
  } catch (error) {
    console.error("AI Optimization Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu durante a otimização.";
    return { 
        message: `Otimização falhou: ${errorMessage}`,
        success: false,
    };
  }
}
