"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Location } from '@/context/chat-context';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const locationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  type: z.string().min(1, 'Debes seleccionar un tipo.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface ManageLocationProps {
  location?: Location;
  campaignId: string;
  children: React.ReactNode;
}

const locationTypes = [
  'Ciudad', 'Pueblo', 'Ruina', 'Dungeon', 'Base Secreta', 'Región Natural', 'Espacio', 'Otro'
];

export function ManageLocation({ location, campaignId, children }: ManageLocationProps) {
  const { addLocation, updateLocation } = useChat();
  const [open, setOpen] = useState(false);
  const isEditMode = !!location;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: location || {
      name: '',
      type: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(location || { name: '', type: '', description: '' });
    }
  }, [location, form, open]);

  function onSubmit(values: LocationFormValues) {
    if (isEditMode && location) {
      updateLocation(campaignId, location.id, values);
    } else {
      addLocation(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Localización</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica los detalles de esta localización.' : 'Añade un nuevo lugar importante a tu campaña.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Localización</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: La Ciudadela de Plata" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Localización</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Detallada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la apariencia, atmósfera, puntos de interés, habitantes típicos..."
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
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Localización'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}