"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Faction } from '@/context/chat-context';
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

const factionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  keyLeaders: z.string().optional(),
  relationships: z.string().optional(),
});

type FactionFormValues = z.infer<typeof factionSchema>;

interface ManageFactionProps {
  faction?: Faction;
  campaignId: string;
  children: React.ReactNode;
}

export function ManageFaction({ faction, campaignId, children }: ManageFactionProps) {
  const { addFaction, updateFaction } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!faction;

  const form = useForm<FactionFormValues>({
    resolver: zodResolver(factionSchema),
    defaultValues: faction || {
      name: '',
      description: '',
      keyLeaders: '',
      relationships: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(faction || { name: '', description: '', keyLeaders: '', relationships: '' });
    }
  }, [faction, form, open]);

  function onSubmit(values: FactionFormValues) {
    if (isEditMode && faction) {
      updateFaction(campaignId, faction.id, values);
    } else {
      addFaction(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Facción/Organización</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica los detalles de esta facción.' : 'Añade un nuevo grupo de poder a tu campaña.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Facción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: El Gremio de Ladrones" {...field} />
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
                      placeholder="Objetivos, ideologías, métodos, tamaño, influencia..."
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
              name="keyLeaders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líderes Clave</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Elara Sombría, Kael el Silencioso" {...field} />
                  </FormControl>
                  <FormDescription>Nombres de figuras importantes (separados por comas).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relationships"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relaciones con otras Facciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: 'Aliado con la Guardia Real, Enemigo de los Cultistas del Vacío'"
                      className="resize-y min-h-[80px]"
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
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Facción'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}