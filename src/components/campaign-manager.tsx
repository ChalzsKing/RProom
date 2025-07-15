"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Campaign, NonPlayerCharacter } from '@/context/chat-context';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { ManageNpcs } from './manage-npcs'; // Reusing for campaign NPCs

const campaignSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  worldDescription: z.string().min(20, 'La descripción del mundo debe tener al menos 20 caracteres.'),
  uniqueFeatures: z.string().optional(),
  worldTone: z.string(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignManagerProps {
  campaign: Campaign;
  children: React.ReactNode;
}

const worldTones = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'fantasia-epica', label: 'Fantasía Épica' },
  { value: 'grimdark', label: 'Grimdark' },
  { value: 'ciberpunk', label: 'Ciberpunk' },
  { value: 'horror-cosmico', label: 'Horror Cósmico' },
  { value: 'ciencia-ficcion', label: 'Ciencia Ficción' },
  { value: 'noir', label: 'Noir' },
  { value: 'comedia', label: 'Comedia' },
];

export function CampaignManager({ campaign, children }: CampaignManagerProps) {
  const { updateCampaign, campaignNpcs, addCampaignNpc, updateCampaignNpc, deleteCampaignNpc } = useChat();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign.name,
      worldDescription: campaign.worldDescription,
      uniqueFeatures: campaign.uniqueFeatures,
      worldTone: campaign.worldTone,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: campaign.name,
        worldDescription: campaign.worldDescription,
        uniqueFeatures: campaign.uniqueFeatures,
        worldTone: campaign.worldTone,
      });
      setActiveTab('general'); // Reset to general tab when opening
    }
  }, [campaign, form, open]);

  function onSubmit(values: CampaignFormValues) {
    updateCampaign(campaign.id, values);
    setOpen(false);
  }

  const handleDeleteNpc = (npcId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este PNJ de campaña?')) {
      deleteCampaignNpc(campaign.id, npcId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[700px] bg-background text-foreground border-l border-border flex flex-col">
        <SheetHeader>
          <SheetTitle>Gestionar Campaña: {campaign.name}</SheetTitle>
          <SheetDescription>
            Define el mundo, sus reglas y sus personajes recurrentes. Esta información se usará para dar contexto a la IA.
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Visión General</TabsTrigger>
            <TabsTrigger value="npcs">PNJs Recurrentes</TabsTrigger>
            {/* <TabsTrigger value="locations">Localizaciones</TabsTrigger> */}
            {/* <TabsTrigger value="factions">Facciones</TabsTrigger> */}
            {/* <TabsTrigger value="rules">Reglas y Glosario</TabsTrigger> */}
          </TabsList>

          <TabsContent value="general" className="flex-1 overflow-y-auto pr-4 mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Campaña</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: El Reino de Eldoria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="worldDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción General del Mundo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe la historia, la geografía, la cultura y la atmósfera general de tu mundo..."
                          className="resize-y min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Este es el contexto principal que la IA usará para entender tu universo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniqueFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Características Únicas / Leyes del Mundo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: 'No existen las ruedas', 'La magia es caótica', 'Los dioses caminan entre los mortales'..."
                          className="resize-y min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detalles específicos que definen las reglas o peculiaridades de tu mundo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="worldTone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tono General del Mundo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tono de tu mundo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {worldTones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define la atmósfera predominante de tu campaña.
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
          </TabsContent>

          <TabsContent value="npcs" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">PNJs Recurrentes de Campaña</h3>
              <ManageNpcs campaignId={campaign.id} isCampaignNpc={true}> {/* Pass isCampaignNpc prop */}
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir PNJ
                </Button>
              </ManageNpcs>
            </div>
            {campaignNpcs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay PNJs recurrentes en esta campaña. Añade algunos para que la IA los recuerde.</p>
            ) : (
              <div className="space-y-2">
                {campaignNpcs.map((npc) => (
                  <div key={npc.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{npc.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{npc.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageNpcs npc={npc} campaignId={campaign.id} isCampaignNpc={true}> {/* Pass isCampaignNpc prop */}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar PNJ</span>
                        </Button>
                      </ManageNpcs>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNpc(npc.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar PNJ</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}