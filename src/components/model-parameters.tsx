"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChat } from '@/context/chat-context';
import { Settings } from 'lucide-react';

const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(1).default(0.7),
  maxLength: z.number().min(1).max(2000).default(500),
  tone: z.string().min(1).max(50).default('neutral'),
});

type ModelParametersFormValues = z.infer<typeof modelParametersSchema>;

export function ModelParameters() {
  const { currentPreset, setCurrentPreset } = useChat();
  const [open, setOpen] = React.useState(false);

  const form = useForm<ModelParametersFormValues>({
    resolver: zodResolver(modelParametersSchema),
    defaultValues: currentPreset,
  });

  React.useEffect(() => {
    form.reset(currentPreset);
  }, [currentPreset, form]);

  const onSubmit = (data: ModelParametersFormValues) => {
    setCurrentPreset(data);
    setOpen(false); // Cerrar el panel después de guardar
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configuración de Parámetros del Modelo</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-sidebar text-sidebar-foreground border-l border-sidebar-border">
        <SheetHeader>
          <SheetTitle className="text-sidebar-primary-foreground">Parámetros del Modelo</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Ajusta los parámetros del modelo de IA para el GPT personalizado actual.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temperature" className="text-right">
              Temperatura
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              {...form.register("temperature", { valueAsNumber: true })}
              className="col-span-3 bg-input text-foreground border-input focus-visible:ring-ring"
            />
            {form.formState.errors.temperature && (
              <p className="col-span-4 text-destructive text-sm">{form.formState.errors.temperature.message}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxLength" className="text-right">
              Longitud Máx.
            </Label>
            <Input
              id="maxLength"
              type="number"
              {...form.register("maxLength", { valueAsNumber: true })}
              className="col-span-3 bg-input text-foreground border-input focus-visible:ring-ring"
            />
            {form.formState.errors.maxLength && (
              <p className="col-span-4 text-destructive text-sm">{form.formState.errors.maxLength.message}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tone" className="text-right">
              Tono
            </Label>
            <Input
              id="tone"
              {...form.register("tone")}
              className="col-span-3 bg-input text-foreground border-input focus-visible:ring-ring"
            />
            {form.formState.errors.tone && (
              <p className="col-span-4 text-destructive text-sm">{form.formState.errors.tone.message}</p>
            )}
          </div>
          <SheetFooter>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar cambios
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}