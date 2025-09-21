
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { StockItem } from '@/types';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


interface StockAdjustmentDialogProps {
  item: StockItem;
  onOpenChange: (open: boolean) => void;
  onAdjust: (amount: number) => void;
}

export default function StockAdjustmentDialog({ item, onOpenChange, onAdjust }: StockAdjustmentDialogProps) {
  const { t } = useSettings();
  const [amount, setAmount] = useState(1);
  const [operation, setOperation] = useState<'add' | 'subtract'>('subtract');

  const handleAdjust = () => {
    const finalAmount = operation === 'add' ? amount : -amount;
    if (finalAmount !== 0) {
      onAdjust(finalAmount);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Estoque: {item.name}</DialogTitle>
          <DialogDescription>
            {`Quantidade atual: ${item.quantity} ${item.unit}. Adicione ou remova itens do inventário.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
            <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setAmount(prev => Math.max(1, prev - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 1)}
                    className="w-24 text-center text-lg font-bold"
                />
                <Button variant="outline" size="icon" onClick={() => setAmount(prev => prev + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            
            <ToggleGroup 
                type="single" 
                value={operation}
                onValueChange={(value: 'add' | 'subtract') => value && setOperation(value)}
                className="justify-center"
            >
                <ToggleGroupItem value="add" aria-label="Adicionar ao estoque" className="flex-1">
                    <ArrowUp className="h-4 w-4 mr-2 text-green-500"/>
                    Entrada
                </ToggleGroupItem>
                <ToggleGroupItem value="subtract" aria-label="Remover do estoque" className="flex-1">
                    <ArrowDown className="h-4 w-4 mr-2 text-red-500"/>
                    Saída
                </ToggleGroupItem>
            </ToggleGroup>
        </div>


        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('stock.form.cancel', 'Cancelar')}
          </Button>
          <Button 
            onClick={handleAdjust} 
            className={cn(operation === 'add' ? 'bg-green-600 hover:bg-green-600/90' : 'bg-red-600 hover:bg-red-600/90')}
            >
                {operation === 'add' ? 'Adicionar ao Estoque' : 'Remover do Estoque'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </change>
  <change>
    <file>src/components/ui/toggle-group.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }

    