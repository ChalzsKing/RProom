"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Narrator } from '@/context/chat-context';
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
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const narratorSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  systemPrompt: z.string().min(20, 'La instrucción del sistema debe tener al menos 20 caracteres.'),
  temperature: z.number().min(0).max(1),
  maxLength: z.number().min(50).max(4000),
  tone: z.string().min(2, 'El tono debe tener al menos 2 caracteres.'),
});

type NarratorFormValues = z.infer<typeof narratorSchema>;

const tones = ['neutral', 'amistoso', 'formal', 'técnico', 'creativo', 'profesional', 'imaginativo', 'experto (sin filtros)', 'narrativo', 'misterioso'];

interface ManageNarratorsProps {
  narrator?: Narrator;
  children: React.ReactNode;
}

export function ManageNarrators({ narrator, children }: ManageNarratorsProps) {
  const { addNarrator, updateNarrator } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!narrator;

  const form = useForm<NarratorFormValues>({
    resolver: zodResolver(narratorSchema),
    defaultValues: narrator || {
      name: '',
      description: '',
      systemPrompt: '',
      temperature: 0.7,
      maxLength: 1000,
      tone: 'narrativo',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(narrator || {
        name: '',
        description: '',
        systemPrompt: '',
        temperature: 0.7,
        maxLength: 1000,
        tone: 'narrativo',
      });
    }
  }, [narrator, form, open]);

  function onSubmit(values: NarratorFormValues) {
    if (isEditMode && narrator) {
      updateNarrator(narrator.id, values);
    } else {
      addNarrator(values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Narrador (IA)</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica la personalidad de tu narrador de IA.' : 'Define el comportamiento, conocimiento y estilo de tu propio narrador de IA.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Narrador</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Dungeon Master Clásico" {...field} />
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
                    <Input placeholder="Una breve descripción de su rol." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucción del Sistema (Personalidad)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Eres un maestro de ceremonias para un juego de rol..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Esta es la instrucción principal que define a tu IA.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creatividad (Temperatura): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="maxLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud Máxima de Respuesta</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tono</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tono para la IA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </SheetClose>
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Narrador'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}