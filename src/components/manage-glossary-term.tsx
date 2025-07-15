"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, GlossaryTerm } from '@/context/chat-context';
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

const glossaryTermSchema = z.object({
  term: z.string().min(2, 'El término debe tener al menos 2 caracteres.'),
  definition: z.string().min(10, 'La definición debe tener al menos 10 caracteres.'),
});

type GlossaryTermFormValues = z.infer<typeof glossaryTermSchema>;

interface ManageGlossaryTermProps {
  term?: GlossaryTerm;
  campaignId: string;
  children: React.ReactNode;
}

export function ManageGlossaryTerm({ term, campaignId, children }: ManageGlossaryTermProps) {
  const { addGlossaryTerm, updateGlossaryTerm } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!term;

  const form = useForm<GlossaryTermFormValues>({
    resolver: zodResolver(glossaryTermSchema),
    defaultValues: term || {
      term: '',
      definition: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(term || { term: '', definition: '' });
    }
  }, [term, form, open]);

  function onSubmit(values: GlossaryTermFormValues) {
    if (isEditMode && term) {
      updateGlossaryTerm(campaignId, term.id, values);
    } else {
      addGlossaryTerm(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Añadir'} Término del Glosario</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica este término único de tu mundo.' : 'Añade un término o concepto específico de tu mundo para que la IA lo entienda.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Término</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Aetherium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definición</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Un mineral raro que se encuentra en las profundidades, capaz de almacenar y amplificar energía mágica."
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
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Añadir Término'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}