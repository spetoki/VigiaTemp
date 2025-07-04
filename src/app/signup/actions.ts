
'use server';

import { z } from 'zod';

const SignUpSchema = z.object({
    name: z.string().min(2, { message: 'signup.nameMinLength' }),
    email: z.string().email({ message: 'signup.emailInvalid' }),
    password: z.string().min(6, { message: 'signup.passwordMinLength' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'signup.passwordMismatch',
    path: ['confirmPassword'],
  });


export type SignUpFormState = {
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    form?: string[];
  };
  fields?: {
    name?: string;
    email?: string;
    password?: string;
  };
  success?: boolean;
};

export async function signup(
  prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const rawFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validatedFields = SignUpSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: 'signup.validationError',
      errors: validatedFields.error.flatten().fieldErrors,
      fields: {
        name: rawFormData.name,
        email: rawFormData.email,
      },
    };
  }

  const { name, email, password } = validatedFields.data;

  // Simulação de chamada de API de cadastro
  console.log('Tentativa de cadastro (pendente de aprovação):', { name, email, password });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email === 'usado@exemplo.com') {
    return {
        message: 'signup.errorTitle',
        errors: { email: ['signup.emailInUse'] },
        fields: {
            name: rawFormData.name,
            email: rawFormData.email,
        },
    };
  }

  return { 
    message: 'signup.successPendingApproval',
    success: true, 
    fields: {
        name: rawFormData.name,
        email: rawFormData.email,
        password: rawFormData.password,
    } 
  };
}
