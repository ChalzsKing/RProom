"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, ImportantItem } from '@/context/chat-context';
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

const importantItemSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  properties: z.string().optional(),
});

type ImportantItemFormValues = z.infer<typeof importantItemSchema>;

interface ManageImportantItemProps {
  item?: ImportantItem;
  campaignId: string;
  children: React.ReactNode;
}

export function ManageImportantItem({ item, campaignId, children }: ManageImportantItemProps) {
  const { addImportantItem, updateImportantItem } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!item;

  const form = useForm<ImportantItemFormValues>({
    resolver: zodResolver(importantItemSchema),
    defaultValues: item || {
      name: '',
      description: '',
      properties: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(item || { name: '', description: '', properties: '' });
    }
  }, [item, form, open]);

  function onSubmit(values: ImportantItemFormValues) {
    if (isEditMode && item) {
      updateImportantItem(campaignId, item.id, values);
    } else {
      addImportantItem(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Añadir'} Objeto Importante</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica los detalles de este objeto.' : 'Añade un objeto, artefacto o tesoro único a tu campaña.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Objeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Amuleto de la Visión Verdadera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Historia, apariencia, origen..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="properties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propiedades / Efectos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: 'Otorga invisibilidad una vez al día, +5 a la percepción, brilla en presencia de magia oscura.'"
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cómo funciona el objeto o qué efectos tiene en el juego.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </SheetClose>
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Añadir Objeto'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}