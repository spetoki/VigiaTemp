
"use server";

import { optimizeAlarmSettings, OptimizeAlarmSettingsInput, OptimizeAlarmSettingsOutput } from '@/ai/flows/optimize-alarm-settings';
import { z } from 'zod';

const OptimizeAlarmSettingsFormSchema = z.object({
  historicalData: z.string().min(1, 'Os dados históricos são obrigatórios.'),
  cacaoVariety: z.string().min(1, 'A variedade de cacau é obrigatória.'),
  microclimateInfo: z.string().min(1, 'As informações do microclima são obrigatórias.'),
});

export type OptimizeFormState = {
  message?: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: OptimizeAlarmSettingsOutput;
};

export async function handleOptimizeAlarms(
  prevState: OptimizeFormState,
  formData: FormData
): Promise<OptimizeFormState> {
  const rawFormData = {
    historicalData: formData.get('historicalData'),
    cacaoVariety: formData.get('cacaoVariety'),
    microclimateInfo: formData.get('microclimateInfo'),
  };

  const validatedFields = OptimizeAlarmSettingsFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const allIssues: string[] = [];
    if (fieldErrors.historicalData) allIssues.push(...fieldErrors.historicalData);
    if (fieldErrors.cacaoVariety) allIssues.push(...fieldErrors.cacaoVariety);
    if (fieldErrors.microclimateInfo) allIssues.push(...fieldErrors.microclimateInfo);

    return {
      message: "A validação do formulário falhou.",
      fields: rawFormData as Record<string, string>,
      issues: allIssues.length > 0 ? allIssues : undefined,
    };
  }
  
  try {
    const input: OptimizeAlarmSettingsInput = validatedFields.data;
    const result = await optimizeAlarmSettings(input);
    return { message: "Otimização bem-sucedida!", data: result };
  } catch (error) {
    console.error("AI Optimization Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu durante a otimização.";
    return { 
        message: `Otimização falhou: ${errorMessage}`,
        fields: validatedFields.data,
    };
  }
}
