"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, CustomGpt } from '@/context/chat-context';
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
import { PlusCircle } from 'lucide-react';
import { Slider } from './ui/slider';

const gptSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  systemPrompt: z.string().min(20, 'El prompt del sistema debe tener al menos 20 caracteres.'),
  temperature: z.number().min(0).max(1),
  maxLength: z.number().min(50).max(4000),
  tone: z.string().min(2, 'El tono debe tener al menos 2 caracteres.'),
});

export function ManageGpts() {
  const { addCustomGpt } = useChat();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof gptSchema>>({
    resolver: zodResolver(gptSchema),
    defaultValues: {
      name: '',
      description: '',
      systemPrompt: '',
      temperature: 0.7,
      maxLength: 500,
      tone: 'neutral',
    },
  });

  function onSubmit(values: z.infer<typeof gptSchema>) {
    addCustomGpt(values);
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Crear GPT Personalizado</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>Crear GPT Personalizado</SheetTitle>
          <SheetDescription>
            Define el comportamiento, conocimiento y estilo de tu propio asistente de IA.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Experto en Marketing" {...field} />
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
                  <FormLabel>Prompt del Sistema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Eres un asistente experto en..."
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
                  <FormLabel>Temperatura: {field.value}</FormLabel>
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
                  <FormLabel>Longitud Máxima</FormLabel>
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
                  <FormControl>
                    <Input placeholder="Ej: Profesional, Amistoso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </SheetClose>
              <Button type="submit">Crear GPT</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}