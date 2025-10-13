
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Alert } from '@/types';
import { useSettings } from '@/context/SettingsContext';

const formSchema = z.object({
  acknowledgedBy: z.string().min(3, "O nome do responsável é obrigatório (mín. 3 caracteres)."),
  acknowledgementNote: z.string().min(10, "A nota de confirmação é obrigatória (mín. 10 caracteres)."),
});

type FormData = z.infer<typeof formSchema>;

interface AcknowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  alert: Alert;
}

export default function AcknowledgeDialog({ isOpen, onClose, onSubmit, alert }: AcknowledgeDialogProps) {
  const { t } = useSettings();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acknowledgedBy: '',
      acknowledgementNote: '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Ação de Alerta</DialogTitle>
          <DialogDescription>
            Para confirmar o alerta para o sensor "{alert.sensorName}", por favor, preencha os campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="acknowledgedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acknowledgementNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota de Confirmação / Ação Tomada</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a ação que foi tomada para resolver este alerta." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Confirmar Alerta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
