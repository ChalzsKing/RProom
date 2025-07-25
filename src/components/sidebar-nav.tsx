"use client";

import React, { useState, useEffect } from 'react';
import { Folder, Briefcase, MessageSquare, PlusCircle, Plus, Brain, Sparkles, Pencil, RotateCcw, User, Users, Trash2, Bot } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManageNarrators } from './manage-narrators';
import { ManagePcs } from './manage-pcs';
import { ManageNpcs } from './manage-npcs';
import { ManageAdventure } from './manage-adventure';
import { CampaignManager } from './campaign-manager';
import { toast } from 'sonner';

export function SidebarNav() {
  const {
    activeProvider, setActiveProvider,
    campaigns = [], // Default empty array if undefined
    addCampaign, deleteCampaign, addSession, addAdventure, // <--- Añadido addAdventure aquí
    activeSessionId, setActiveSessionId, getActiveAdventure,
    narrators = [], // Default empty array if undefined
    activeNarrator, setActiveNarrator,
  } = useChat();

  const [openCampaigns, setOpenCampaigns] = useState<string[]>([]); // Declare openCampaigns state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'campaign' | 'adventure' | 'session' | null>(null);
  const [dialogInput, setDialogInput] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdventureId, setSelectedAdventureId] = useState<string | null>(null);

  const openDialog = (type: typeof dialogType, campaignId?: string, adventureId?: string) => {
    setDialogType(type);
    setDialogInput('');
    setSelectedCampaignId(campaignId || null);
    setSelectedAdventureId(adventureId || null);
    setDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    if (!dialogInput.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }

    if (dialogType === 'campaign') {
      addCampaign(dialogInput);
    } else if (dialogType === 'adventure' && selectedCampaignId) {
      // For now, we'll just add a placeholder premise. The full ManageAdventure component handles premise.
      addAdventure(selectedCampaignId, { name: dialogInput, premise: 'Una nueva aventura comienza...' });
    } else if (dialogType === 'session' && selectedAdventureId) {
      const newSession = addSession(selectedAdventureId, dialogInput);
      if (newSession) {
        setActiveSessionId(newSession.id);
      }
    }
    setDialogOpen(false);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña y todo su contenido?')) {
      deleteCampaign(campaignId);
    }
  };

  const getCampaignById = (id: string) => campaigns.find(c => c.id === id);
  const getAdventureById = (campaignId: string, adventureId: string) => 
    getCampaignById(campaignId)?.adventures.find(a => a.id === adventureId);

  return (
    <>
      <div className="hidden lg:flex h-full max-h-screen flex-col gap-2 bg-background p-4 text-foreground border-r border-border">
        {/* Campaigns section */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground">Campañas</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openDialog('campaign')}>
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Nueva Campaña</span>
          </Button>
        </div>

        <Accordion type="multiple" className="w-full" value={openCampaigns} onValueChange={setOpenCampaigns}>
          {(campaigns || []).map((campaign) => (
            <AccordionItem key={campaign.id} value={campaign.id} className="border-b-0">
              <div className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
                <AccordionTrigger className="flex-1 px-3 py-2 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{campaign.name}</span>
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-1 pr-2">
                  <CampaignManager campaign={campaign}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Gestionar Campaña</span>
                    </Button>
                  </CampaignManager>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCampaign(campaign.id)}>
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Eliminar Campaña</span>
                  </Button>
                </div>
              </div>
              <AccordionContent className="pl-6">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground">Aventuras</span>
                  <ManageAdventure campaignId={campaign.id}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Nueva Aventura</span>
                    </Button>
                  </ManageAdventure>
                </div>
                <Accordion type="multiple" className="w-full">
                  {(campaign.adventures || []).map((adventure) => (
                    <AccordionItem key={adventure.id} value={adventure.id} className="border-b-0">
                      <div className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
                        <AccordionTrigger className="flex-1 px-3 py-2 text-sm font-medium hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{adventure.name}</span>
                          </div>
                        </AccordionTrigger>
                        <div className="flex items-center gap-1 pr-2">
                          <ManageAdventure adventure={adventure} campaignId={campaign.id}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil className="h-3 w-3" />
                              <span className="sr-only">Editar Aventura</span>
                            </Button>
                          </ManageAdventure>
                          {/* No delete for adventure yet */}
                        </div>
                      </div>
                      <AccordionContent className="pl-6">
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className="text-xs font-semibold text-muted-foreground">Sesiones</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openDialog('session', campaign.id, adventure.id)}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Nueva Sesión</span>
                          </Button>
                        </div>
                        {(adventure.sessions || []).map((session) => (
                          <Button
                            key={session.id}
                            variant="ghost"
                            className={`w-full justify-start px-3 py-2 text-sm ${activeSessionId === session.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent/50'}`}
                            onClick={() => setActiveSessionId(session.id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span className="truncate">{session.name}</span>
                          </Button>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Narrators section */}
        <div className="mt-4 flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground">Narradores (IA)</span>
          <ManageNarrators>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Crear Narrador</span>
            </Button>
          </ManageNarrators>
        </div>
        
        {(narrators || []).map((narrator) => (
          <div key={narrator.id} className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
            <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 text-sm ${activeNarrator?.id === narrator.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent/50'}`}
              onClick={() => setActiveNarrator(narrator.id)}
            >
              <Brain className="mr-2 h-4 w-4" />
              <span className="truncate">{narrator.name}</span>
            </Button>
            <ManageNarrators narrator={narrator}>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Editar Narrador</span>
              </Button>
            </ManageNarrators>
          </div>
        ))}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-background text-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === 'campaign' && 'Nueva Campaña'}
              {dialogType === 'adventure' && 'Nueva Aventura'}
              {dialogType === 'session' && 'Nueva Sesión'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Introduce el nombre para tu {dialogType === 'campaign' ? 'campaña' : dialogType === 'adventure' ? 'aventura' : 'sesión'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Nombre"
            value={dialogInput}
            onChange={(e) => setDialogInput(e.target.value)}
            className="bg-input text-foreground border-input focus-visible:ring-ring"
          />
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleDialogSubmit}>Crear</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}