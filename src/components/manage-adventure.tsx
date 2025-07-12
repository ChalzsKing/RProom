"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Adventure, PlayerCharacter } from '@/context/chat-context';
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
import { Sparkles, Loader2, UserPlus, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

const adventureSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  premise: z.string().min(10, 'La premisa debe tener al menos 10 caracteres.'),
});

type AdventureFormValues = z.infer<typeof adventureSchema>;

interface ManageAdventureProps {
  adventure?: Adventure;
  campaignId?: string;
  children: React.ReactNode;
}

export function ManageAdventure({ adventure, campaignId, children }: ManageAdventureProps) {
  const { addAdventure, updateAdventure, addPlayerCharacter } = useChat();
  const [open, setOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingPcs, setIsSuggestingPcs] = useState(false);
  const [suggestedPcs, setSuggestedPcs] = useState<Omit<PlayerCharacter, 'id'>[]>([]);
  const isEditMode = !!adventure;

  const form = useForm<AdventureFormValues>({
    resolver: zodResolver(adventureSchema),
    defaultValues: adventure || {
      name: '',
      premise: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(adventure || { name: '', premise: '' });
      setAiPrompt('');
      setSuggestedPcs([]);
    }
  }, [adventure, form, open]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Por favor, introduce una idea para la aventura.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar la aventura');
      }

      const data = await response.json();
      form.setValue('name', data.name, { shouldValidate: true });
      form.setValue('premise', data.premise, { shouldValidate: true });
      toast.success('¡Aventura generada con éxito!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestPcs = async () => {
    const premise = form.getValues('premise');
    if (!premise.trim()) {
      toast.warning('La premisa no puede estar vacía para sugerir personajes.');
      return;
    }
    setIsSuggestingPcs(true);
    setSuggestedPcs([]);
    try {
      const suggestionPromises = Array(3).fill(0).map(() => 
        fetch('/api/generate-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `Un personaje para una aventura con esta premisa: "${premise}"` }),
        }).then(res => {
          if (!res.ok) throw new Error('Fallo en la sugerencia de personaje');
          return res.json();
        })
      );
      const results = await Promise.all(suggestionPromises);
      setSuggestedPcs(results);
      toast.success('¡Sugerencias de personajes generadas!');
    } catch (error: any) {
      toast.error(`Error al sugerir personajes: ${error.message}`);
    } finally {
      setIsSuggestingPcs(false);
    }
  };

  const handleAddPc = (pcData: Omit<PlayerCharacter, 'id'>) => {
    if (campaignId) {
      addPlayerCharacter(campaignId, pcData);
      setSuggestedPcs(prev => prev.filter(pc => pc.name !== pcData.name));
    }
  };

  function onSubmit(values: AdventureFormValues) {
    if (isEditMode && adventure) {
      updateAdventure(adventure.id, values);
    } else if (campaignId) {
      addAdventure(campaignId, values);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar' : 'Crear'} Aventura</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Modifica el nombre y la premisa de la aventura. La premisa sirve como contexto constante para la IA.'
              : 'Crea una nueva aventura, manualmente o con la ayuda de la IA.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-4 space-y-6 py-4">
          {!isEditMode && (
            <div className="space-y-2 p-4 border rounded-lg bg-secondary/50">
              <Label htmlFor="ai-prompt" className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Generar con IA
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder="Idea de la aventura, ej: 'una ciudad submarina perdida y una antigua maldición'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="resize-y"
              />
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar Aventura
              </Button>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Aventura</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: La Ciudad bajo las Olas" {...field} />
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
                        placeholder="Hace siglos, la ciudad de Aquaria fue consumida por el océano..."
                        className="resize-y min-h-[150px]"
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
                <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Aventura'}</Button>
              </SheetFooter>
            </form>
          </Form>

          {campaignId && (
            <div className="space-y-4 pt-4">
              <Separator />
              <h3 className="text-lg font-semibold">Sugerencia de Personajes</h3>
              <p className="text-sm text-muted-foreground">
                Basado en la premisa, la IA puede sugerir personajes jugadores para tu campaña.
              </p>
              <Button onClick={handleSuggestPcs} disabled={isSuggestingPcs} variant="outline" className="w-full">
                {isSuggestingPcs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Sugerir 3 Personajes
              </Button>
              <div className="space-y-4">
                {suggestedPcs.map((pc, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{pc.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{pc.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleAddPc(pc)} size="sm" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir a la Campaña
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}