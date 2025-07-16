"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChat, Campaign, NonPlayerCharacter, Adventure, Location, Faction, GlossaryTerm, ImportantItem, HouseRule } from '@/context/chat-context';
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
import { Plus, Pencil, Trash2, Bot, MapPin, Users, Book, Gem, ScrollText, Briefcase, Sparkles, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { ManageNpcs } from './manage-npcs';
import { ManageLocation } from './manage-location';
import { ManageFaction } from './manage-faction';
import { ManageGlossaryTerm } from './manage-glossary-term';
import { ManageImportantItem } from './manage-important-item';
import { ManageHouseRule } from './manage-house-rule';
import { ManageAdventure } from './manage-adventure';
import { ManagePcs } from './manage-pcs'; // Import ManagePcs
import { Label } from './ui/label';

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
  const { 
    updateCampaign, 
    deleteCampaignNpc,
    deleteLocation,
    deleteFaction,
    deleteGlossaryTerm,
    deleteImportantItem,
    deleteHouseRule,
    deletePlayerCharacter, // Added this
    populateCampaignFromAI,
  } = useChat();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);

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
      setActiveTab('general');
      setAiPrompt('');
    }
  }, [campaign, form, open]);

  function onSubmit(values: CampaignFormValues) {
    updateCampaign(campaign.id, values);
    setOpen(false);
  }

  const handleGenerateWorld = async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Por favor, introduce una idea para el mundo.');
      return;
    }
    setIsGeneratingWorld(true);
    const toastId = toast.loading('Generando el mundo... Esto puede tardar un poco.');

    try {
      const response = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el mundo');
      }

      const data = await response.json();

      // Update form fields for immediate feedback
      form.setValue('worldDescription', data.worldDescription, { shouldValidate: true });
      form.setValue('uniqueFeatures', data.uniqueFeatures, { shouldValidate: true });

      // Call the atomic function to update the campaign state with all generated items
      populateCampaignFromAI(campaign.id, data);

      toast.success('¡Mundo generado con éxito! Revisa las pestañas.', { id: toastId });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsGeneratingWorld(false);
    }
  };

  const handleDeleteNpc = (npcId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este PNJ de campaña?')) {
      deleteCampaignNpc(campaign.id, npcId);
    }
  };

  const handleDeleteLocation = (locationId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta localización?')) {
      deleteLocation(campaign.id, locationId);
    }
  };

  const handleDeleteFaction = (factionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta facción?')) {
      deleteFaction(campaign.id, factionId);
    }
  };

  const handleDeleteGlossaryTerm = (termId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este término del glosario?')) {
      deleteGlossaryTerm(campaign.id, termId);
    }
  };

  const handleDeleteImportantItem = (itemId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este objeto importante?')) {
      deleteImportantItem(campaign.id, itemId);
    }
  };

  const handleDeleteHouseRule = (ruleId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta regla de la casa?')) {
      deleteHouseRule(campaign.id, ruleId);
    }
  };

  const handleDeletePc = (pcId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este Personaje Jugador?')) {
      deletePlayerCharacter(campaign.id, pcId);
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pcs">Personajes</TabsTrigger> {/* New tab */}
            <TabsTrigger value="npcs">PNJs</TabsTrigger>
            <TabsTrigger value="locations">Lugares</TabsTrigger>
            <TabsTrigger value="factions">Facciones</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            {/* <TabsTrigger value="adventures">Aventuras</TabsTrigger> // Adventures are managed from sidebar */}
          </TabsList>

          <TabsContent value="general" className="flex-1 overflow-y-auto pr-4 mt-4 space-y-6">
            <div className="space-y-2 p-4 border rounded-lg bg-secondary/50">
              <Label htmlFor="ai-world-prompt" className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Generador de Mundo con IA
              </Label>
              <Textarea
                id="ai-world-prompt"
                placeholder="Idea del mundo, ej: 'Un mundo post-apocalíptico donde la naturaleza ha reclamado las ciudades y las tribus luchan con tecnología antigua'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="resize-y"
              />
              <Button onClick={handleGenerateWorld} disabled={isGeneratingWorld} className="w-full">
                {isGeneratingWorld ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar Mundo Completo
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-1">Esto generará descripción, características, PNJs, lugares, facciones y 3 aventuras.</p>
            </div>

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

          <TabsContent value="pcs" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Personajes Jugadores</h3>
              <ManagePcs campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Personaje
                </Button>
              </ManagePcs>
            </div>
            {(campaign.playerCharacters && campaign.playerCharacters.length > 0) ? (
              <div className="space-y-2">
                {campaign.playerCharacters.map((pc) => (
                  <div key={pc.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{pc.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{pc.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManagePcs pc={pc} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Personaje</span>
                        </Button>
                      </ManagePcs>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeletePc(pc.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Personaje</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay personajes jugadores en esta campaña. Añade algunos para empezar la aventura.</p>
            )}
          </TabsContent>

          <TabsContent value="npcs" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">PNJs Recurrentes de Campaña</h3>
              <ManageNpcs campaignId={campaign.id} isCampaignNpc={true}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir PNJ
                </Button>
              </ManageNpcs>
            </div>
            {(campaign.campaignNpcs && campaign.campaignNpcs.length > 0) ? (
              <div className="space-y-2">
                {campaign.campaignNpcs.map((npc) => (
                  <div key={npc.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{npc.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{npc.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageNpcs npc={npc} campaignId={campaign.id} isCampaignNpc={true}>
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
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay PNJs recurrentes en esta campaña. Añade algunos para que la IA los recuerde.</p>
            )}
          </TabsContent>

          <TabsContent value="locations" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Localizaciones</h3>
              <ManageLocation campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Lugar
                </Button>
              </ManageLocation>
            </div>
            {(campaign.locations && campaign.locations.length > 0) ? (
              <div className="space-y-2">
                {campaign.locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{loc.name} <span className="text-xs text-muted-foreground">({loc.type})</span></p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{loc.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageLocation location={loc} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Localización</span>
                        </Button>
                      </ManageLocation>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteLocation(loc.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Localización</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay localizaciones en esta campaña. Añade algunas para que la IA las recuerde.</p>
            )}
          </TabsContent>

          <TabsContent value="factions" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Facciones y Organizaciones</h3>
              <ManageFaction campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Facción
                </Button>
              </ManageFaction>
            </div>
            {(campaign.factions && campaign.factions.length > 0) ? (
              <div className="space-y-2">
                {campaign.factions.map((fac) => (
                  <div key={fac.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{fac.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{fac.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageFaction faction={fac} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Facción</span>
                        </Button>
                      </ManageFaction>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFaction(fac.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Facción</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay facciones en esta campaña. Añade algunas para que la IA las recuerde.</p>
            )}
          </TabsContent>

          <TabsContent value="resources" className="flex-1 overflow-y-auto pr-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Recursos y Reglas del Mundo</h3>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Glosario de Términos</h4>
              <ManageGlossaryTerm campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Término
                </Button>
              </ManageGlossaryTerm>
            </div>
            {(campaign.glossary && campaign.glossary.length > 0) ? (
              <div className="space-y-2 mb-6">
                {campaign.glossary.map((term) => (
                  <div key={term.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Book className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{term.term}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{term.definition}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageGlossaryTerm term={term} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Término</span>
                        </Button>
                      </ManageGlossaryTerm>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteGlossaryTerm(term.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Término</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay términos en el glosario.</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Objetos y Artefactos Importantes</h4>
              <ManageImportantItem campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Objeto
                </Button>
              </ManageImportantItem>
            </div>
            {(campaign.importantItems && campaign.importantItems.length > 0) ? (
              <div className="space-y-2 mb-6">
                {campaign.importantItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Gem className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageImportantItem item={item} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Objeto</span>
                        </Button>
                      </ManageImportantItem>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteImportantItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Objeto</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay objetos importantes.</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Reglas de Juego Específicas / "House Rules"</h4>
              <ManageHouseRule campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Regla
                </Button>
              </ManageHouseRule>
            </div>
            {(campaign.houseRules && campaign.houseRules.length > 0) ? (
              <div className="space-y-2">
                {campaign.houseRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <ScrollText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{rule.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{rule.rule}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageHouseRule rule={rule} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Regla</span>
                        </Button>
                      </ManageHouseRule>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteHouseRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar Regla</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay reglas de la casa.</p>
            )}
          </TabsContent>

          {/* Removed the adventures tab from here as it's managed from the sidebar */}
          {/* <TabsContent value="adventures" className="flex-1 overflow-y-auto pr-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aventuras de la Campaña</h3>
              <ManageAdventure campaignId={campaign.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Aventura
                </Button>
              </ManageAdventure>
            </div>
            {(campaign.adventures && campaign.adventures.length > 0) ? (
              <div className="space-y-2">
                {campaign.adventures.map((adventure) => (
                  <div key={adventure.id} className="flex items-center justify-between rounded-md p-3 bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{adventure.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{adventure.premise}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ManageAdventure adventure={adventure} campaignId={campaign.id}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Aventura</span>
                        </Button>
                      </ManageAdventure>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay aventuras en esta campaña. ¡Crea una para empezar!</p>
            )}
          </TabsContent> */}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}