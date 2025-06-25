
'use server';

import { z } from 'zod';

// LoginSchema is now a local constant, not exported
const LoginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val), // Reverted to sync
    z.string().refine(
      (val) => { // Reverted to sync
        if (val === 'admin') return true; // Permite 'admin' como username
        // Valida como email para outros casos
        return z.string().email().safeParse(val).success; 
      },
      { message: 'Por favor, insira um email válido ou "admin".' }
    )
  ),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormState = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    rememberMe?: string[];
    form?: string[];
  };
  fields?: Record<string, string>;
  redirectTo?: string;
  user?: { email: string; role: 'user' | 'admin' };
};

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  });

  if (!validatedFields.success) {
    return {
      message: 'login.validationError',
      errors: validatedFields.error.flatten().fieldErrors,
      fields: {
        email: formData.get('email') as string,
      },
    };
  }

  const { email, password, rememberMe } = validatedFields.data;

  // Simulação de chamada de API de login
  console.log('Tentativa de login:', { email, password, rememberMe });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const adminUsers: Record<string, string> = {
    'admin': 'admin',
    'spetoki@gmail.com': '123456',
  };

  // Login de Administrador
  if (adminUsers[email]) {
    if (password === adminUsers[email]) {
      return {
          message: 'login.adminSuccess',
          redirectTo: '/admin',
          user: { email, role: 'admin' },
      };
    } else {
      // Senha incorreta para o usuário admin
      return {
          message: 'login.authError',
          errors: { form: ['login.authError'] },
          fields: { email },
      };
    }
  }

  // Simular erro de login para fins de demonstração
  if (password === 'fail') {
    return {
        message: 'login.authError',
        errors: { form: ['login.authError'] },
        fields: { email },
    };
  }

  // Simular login bem-sucedido para usuário comum
  return { 
    message: 'login.userSuccess',
    redirectTo: '/',
    user: { email, role: 'user' },
  };
}

    