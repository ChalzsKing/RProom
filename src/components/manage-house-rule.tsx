"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, HouseRule } from '@/context/chat-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const houseRuleSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres.'),
  rule: z.string().min(10, 'La regla debe tener al menos 10 caracteres.'),
});

type HouseRuleFormValues = z.infer<typeof houseRuleSchema>;

interface ManageHouseRuleProps {
  rule?: HouseRule;
  campaignId: string;
  children: React.ReactNode;
}

export function ManageHouseRule({ rule, campaignId, children }: ManageHouseRuleProps) {
  const { addHouseRule, updateHouseRule } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!rule;

  const form = useForm<HouseRuleFormValues>({
    resolver: zodResolver(houseRuleSchema),
    defaultValues: rule || {
      title: '',
      rule: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(rule || { title: '', rule: '' });
    }
  }, [rule, form, open]);

  function onSubmit(values: HouseRuleFormValues) {
    if (isEditMode && rule) {
      updateHouseRule(campaignId, rule.id, values);
    } else {
      addHouseRule(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Añadir'} Regla de la Casa</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica esta regla específica de tu campaña.' : 'Añade una regla de juego personalizada o una mecánica única para tu campaña.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Regla</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sistema de Cordura" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Regla</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: 'Cada vez que un personaje presencie un horror cósmico, debe hacer una tirada de salvación de Sabiduría CD 15. Si falla, pierde 1d4 puntos de cordura.'"
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </SheetClose>
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Añadir Regla'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}