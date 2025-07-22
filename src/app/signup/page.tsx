

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const { t } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, { message: t('signup.nameMinLength', 'O nome deve ter pelo menos 2 caracteres.') }),
    email: z.string().email({ message: t('signup.emailInvalid', 'Por favor, insira um email válido.') }),
    password: z.string().min(6, { message: t('signup.passwordMinLength', 'A senha deve ter pelo menos 6 caracteres.') }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('signup.passwordMismatch', 'As senhas não coincidem.'),
    path: ['confirmPassword'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    const success = await signup({
        name: values.name,
        email: values.email,
        password: values.password
    });

    if (!success) {
      setError(t('signup.emailInUse', 'Este email já está em uso.'));
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('signup.createAccountButton', 'Criar Conta')}</CardTitle>
          <CardDescription>{t('signup.pageDescription', 'Preencha os campos abaixo para se cadastrar.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('signup.errorTitle', 'Erro')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.nameLabel', 'Nome Completo')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('signup.namePlaceholder', 'Seu nome completo')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.emailLabel', 'Email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('signup.emailPlaceholder', 'seu@email.com')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.passwordLabel', 'Senha')}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('signup.passwordPlaceholder', 'Crie uma senha forte')}
                                {...field}
                            />
                            <Button
                                type="button" variant="ghost" size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? t('signup.hidePassword', "Hide password") : t('signup.showPassword', "Show password")}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.confirmPasswordLabel', 'Confirmar Senha')}</FormLabel>
                    <FormControl>
                       <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder={t('signup.confirmPasswordPlaceholder', 'Repita a senha')}
                                {...field}
                            />
                             <Button
                                type="button" variant="ghost" size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? t('signup.hideConfirmPassword', "Hide confirmation") : t('signup.showConfirmPassword', "Show confirmation")}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t('signup.creatingAccountButton', 'Criando conta...') : t('signup.createAccountButton', 'Criar Conta')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
            <Separator />
            <p className="text-center text-sm text-muted-foreground">
            {t('signup.hasAccount', 'Já tem uma conta?')}{' '}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
                {t('login.loginLink', 'Faça login')}
            </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
