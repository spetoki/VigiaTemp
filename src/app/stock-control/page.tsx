
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { StockItem, StockItemFormData } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Warehouse, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getStockItems, addStockItem, updateStockItem, deleteStockItem } from '@/services/stock-service';

const formSchema = z.object({
  name: z.string().min(1, "O nome do item é obrigatório"),
  category: z.string().min(1, "A categoria é obrigatória"),
  quantity: z.number({ coerce: true }).min(0, "A quantidade não pode ser negativa"),
  unit: z.string().min(1, "A unidade de medida é obrigatória"),
  supplier: z.string().optional(),
});

const StockForm = ({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting,
}: {
  onSubmit: (data: StockItemFormData) => void;
  onCancel: () => void;
  defaultValues: StockItemFormData;
  isSubmitting: boolean;
}) => {
  const { t } = useSettings();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.form.name.label', 'Nome do Item')}</FormLabel>
              <FormControl>
                <Input placeholder={t('stock.form.name.placeholder', 'Ex: Amêndoa de Cacau (Seca)')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.form.category.label', 'Categoria')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.form.category.placeholder', 'Selecione uma categoria')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="matéria-prima">{t('stock.categories.raw_material', 'Matéria-Prima')}</SelectItem>
                  <SelectItem value="produto-acabado">{t('stock.categories.finished_product', 'Produto Acabado')}</SelectItem>
                  <SelectItem value="insumo-agricola">{t('stock.categories.agricultural_input', 'Insumo Agrícola')}</SelectItem>
                  <SelectItem value="embalagem">{t('stock.categories.packaging', 'Embalagem')}</SelectItem>
                  <SelectItem value="ferramenta">{t('stock.categories.tool', 'Ferramenta')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stock.form.quantity.label', 'Quantidade')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stock.form.unit.label', 'Unidade')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('stock.form.unit.placeholder', 'kg, L, sacos, und')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.form.supplier.label', 'Fornecedor (Opcional)')}</FormLabel>
              <FormControl>
                <Input placeholder={t('stock.form.supplier.placeholder', 'Ex: Cooperativa Local')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('stock.form.cancel', 'Cancelar')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('stock.form.save', 'Salvar Item')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function StockControlPage() {
  const { t, storageKeys } = useSettings();
  const { toast } = useToast();

  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  const fetchItems = useCallback(async () => {
    if (!storageKeys.stock) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedItems = await getStockItems(storageKeys.stock);
      setItems(fetchedItems);
    } catch (error) {
      toast({
        title: t('stock.toast.load_error.title', 'Erro ao Carregar Estoque'),
        description: t('stock.toast.load_error.description', 'Não foi possível buscar os itens do estoque.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [storageKeys.stock, t, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenForm = (item: StockItem | null = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: StockItemFormData) => {
    if (!storageKeys.stock) {
      toast({
        title: t('stock.toast.save_error.title', 'Erro ao Salvar'),
        description: t('stock.toast.save_error.no_key', 'Chave de acesso não encontrada.'),
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateStockItem(storageKeys.stock, editingItem.id, data);
        toast({ title: t('stock.toast.update_success.title', 'Item Atualizado'), description: t('stock.toast.update_success.description', `O item "${data.name}" foi atualizado.`) });
      } else {
        await addStockItem(storageKeys.stock, data);
        toast({ title: t('stock.toast.add_success.title', 'Item Adicionado'), description: t('stock.toast.add_success.description', `O item "${data.name}" foi adicionado ao estoque.`) });
      }
      setIsFormOpen(false);
      fetchItems();
    } catch (error) {
      toast({
        title: t('stock.toast.save_error.title', 'Erro ao Salvar'),
        description: error instanceof Error ? error.message : t('stock.toast.unknown_error', 'Ocorreu um erro desconhecido.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !storageKeys.stock) return;
    try {
      await deleteStockItem(storageKeys.stock, itemToDelete.id);
      toast({
        title: t('stock.toast.delete_success.title', 'Item Excluído'),
        description: t('stock.toast.delete_success.description', `O item "${itemToDelete.name}" foi removido do estoque.`),
        variant: 'destructive',
      });
      fetchItems();
    } catch (error) {
      toast({
        title: t('stock.toast.delete_error.title', 'Erro ao Excluir'),
        description: error instanceof Error ? error.message : t('stock.toast.unknown_error', 'Ocorreu um erro desconhecido.'),
        variant: 'destructive',
      });
    } finally {
      setItemToDelete(null);
    }
  };

  const defaultFormValues = editingItem
    ? {
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        supplier: editingItem.supplier || '',
      }
    : {
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        supplier: '',
      };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Warehouse className="mr-3 h-8 w-8" />
            {t('stock.page.title', 'Controle de Estoque da Lavoura')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('stock.page.description', 'Gerencie os insumos, produtos e ferramentas da sua propriedade.')}
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('stock.page.add_item_button', 'Adicionar Novo Item')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('stock.table.title', 'Inventário Atual')}</CardTitle>
          <CardDescription>{t('stock.table.description', 'Lista de todos os itens cadastrados no seu estoque.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('stock.table.header.name', 'Item')}</TableHead>
                  <TableHead>{t('stock.table.header.category', 'Categoria')}</TableHead>
                  <TableHead className="text-center">{t('stock.table.header.quantity', 'Quantidade')}</TableHead>
                  <TableHead>{t('stock.table.header.unit', 'Unidade')}</TableHead>
                  <TableHead>{t('stock.table.header.last_updated', 'Última Atualização')}</TableHead>
                  <TableHead className="text-right">{t('stock.table.header.actions', 'Ações')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {t('stock.table.empty', 'Nenhum item no estoque. Adicione um para começar.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{t(`stock.categories.${item.category.replace(/-/g, '_')}`, item.category)}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString(t('localeCode', 'pt-BR'))}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('stock.form.title.edit', 'Editar Item') : t('stock.form.title.add', 'Adicionar Novo Item')}
            </DialogTitle>
            <DialogDescription>
              {t('stock.form.description', 'Preencha os detalhes do item de estoque.')}
            </DialogDescription>
          </DialogHeader>
          <StockForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            defaultValues={defaultFormValues}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('stock.delete_dialog.title', 'Confirmar Exclusão')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('stock.delete_dialog.description', `Tem certeza de que deseja excluir o item "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>{t('stock.delete_dialog.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              {t('stock.delete_dialog.confirm', 'Excluir')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
