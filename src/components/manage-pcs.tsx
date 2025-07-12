"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, PlayerCharacter } from '@/context/chat-context';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const pcSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type PcFormValues = z.infer<typeof pcSchema>;

interface ManagePcsProps {
  pc?: PlayerCharacter;
  children: React.ReactNode;
}

export function ManagePcs({ pc, children }: ManagePcsProps) {
  const { addPlayerCharacter, updatePlayerCharacter } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!pc;

  const form = useForm<PcFormValues>({
    resolver: zodResolver(pcSchema),
    defaultValues: pc || {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(pc || { name: '', description: '' });
    }
  }, [pc, form, open]);

  function onSubmit(values: PcFormValues) {
    if (isEditMode && pc) {
      updatePlayerCharacter(pc.id, values);
    } else {
      addPlayerCharacter(values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Personaje Jugador</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica los detalles de este personaje.' : 'Crea un nuevo personaje para que participe en la aventura.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Personaje</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Kaelen, el Elfo" {...field} />
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
                  <FormLabel>Descripción Breve</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Un explorador ágil y sabio de los bosques del norte..."
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
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Personaje'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}