"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Adventure } from '@/context/chat-context';
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

const adventureSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  premise: z.string().min(10, 'La premisa debe tener al menos 10 caracteres.'),
});

type AdventureFormValues = z.infer<typeof adventureSchema>;

interface ManageAdventureProps {
  adventure: Adventure;
  children: React.ReactNode;
}

export function ManageAdventure({ adventure, children }: ManageAdventureProps) {
  const { updateAdventure } = useChat();
  const [open, setOpen] = useState(false);

  const form = useForm<AdventureFormValues>({
    resolver: zodResolver(adventureSchema),
    defaultValues: {
      name: adventure.name,
      premise: adventure.premise,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: adventure.name,
        premise: adventure.premise,
      });
    }
  }, [adventure, form, open]);

  function onSubmit(values: AdventureFormValues) {
    updateAdventure(adventure.id, values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>Editar Aventura</SheetTitle>
          <SheetDescription>
            Modifica el nombre y la premisa de la aventura. La premisa sirve como contexto constante para la IA.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Aventura</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: La Cueva del Goblin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="premise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premisa / Contexto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Los jugadores han sido contratados para..."
                      className="resize-y min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este texto se enviará a la IA en cada turno para que no pierda el hilo de la historia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </SheetClose>
              <Button type="submit">Guardar Cambios</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}