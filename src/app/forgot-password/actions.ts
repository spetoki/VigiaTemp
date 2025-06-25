
'use server';

import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'forgotPassword.invalidEmail' }),
});

export type ForgotPasswordFormState = {
  message?: string;
  errors?: {
    email?: string[];
    form?: string[];
  };
  fields?: Record<string, string>;
  success?: boolean;
};

export async function forgotPassword(
  prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: 'forgotPassword.validationError',
      errors: validatedFields.error.flatten().fieldErrors,
      fields: {
        email: formData.get('email') as string,
      },
    };
  }

  const { email } = validatedFields.data;

  // Simulação de envio de email de redefinição de senha
  console.log('Solicitação de redefinição de senha para:', email);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simular atraso da rede

  // Simular sucesso
  // Em um aplicativo real, você chamaria seu provedor de email aqui.
  return {
    message: 'forgotPassword.successMessage',
    success: true,
    fields: { email },
   };
}

    