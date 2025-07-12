"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, NonPlayerCharacter } from '@/context/chat-context';
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
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const npcSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type NpcFormValues = z.infer<typeof npcSchema>;

interface ManageNpcsProps {
  npc?: NonPlayerCharacter;
  campaignId: string;
  children: React.ReactNode;
}

export function ManageNpcs({ npc, campaignId, children }: ManageNpcsProps) {
  const { addNonPlayerCharacter, updateNonPlayerCharacter } = useChat();
  const [open, setOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isEditMode = !!npc;

  const form = useForm<NpcFormValues>({
    resolver: zodResolver(npcSchema),
    defaultValues: npc || {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(npc || { name: '', description: '' });
      setAiPrompt('');
    }
  }, [npc, form, open]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Por favor, introduce una idea para el personaje.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el personaje');
      }

      const data = await response.json();
      form.setValue('name', data.name, { shouldValidate: true });
      form.setValue('description', data.description, { shouldValidate: true });
      toast.success('¡PNJ generado con éxito!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  function onSubmit(values: NpcFormValues) {
    if (isEditMode && npc) {
      updateNonPlayerCharacter(campaignId, npc.id, values);
    } else {
      addNonPlayerCharacter(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Personaje No Jugador (PNJ)</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Modifica los detalles de este PNJ.' : 'Crea un nuevo PNJ para poblar tu mundo. Puedes crearlo manualmente o pedirle a la IA que lo genere por ti.'}
          </SheetDescription>
        </SheetHeader>
        
        {!isEditMode && (
          <div className="my-4 space-y-2 p-4 border rounded-lg bg-secondary/50">
            <Label htmlFor="ai-prompt" className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Generar con IA
            </Label>
            <Textarea
              id="ai-prompt"
              placeholder="Idea del PNJ, ej: 'un tabernero misterioso que sabe demasiados secretos'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="resize-y"
            />
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar PNJ
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del PNJ</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Elara, la herrera" {...field} />
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
                      placeholder="Una mujer fuerte y reservada, cuyas manos cuentan historias de fuego y acero..."
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
              <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear PNJ'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}