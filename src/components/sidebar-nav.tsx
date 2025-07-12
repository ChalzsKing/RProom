"use client";

import React, { useState, useEffect } from 'react';
import { Folder, Briefcase, MessageSquare, PlusCircle, Plus, Brain, Sparkles, Pencil, RotateCcw, User, Users } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManageNarrators } from './manage-narrators';
import { ManagePcs } from './manage-pcs';
import { ManageAdventure } from './manage-adventure';

export function SidebarNav() {
  const {
    activeProvider, setActiveProvider,
    campaigns, addCampaign, addSession,
    activeSessionId, setActiveSessionId, getActiveAdventure,
    narrators, activeNarrator, setActiveNarrator,
    playerCharacters
  } = useChat();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'campaign' | 'session'>('campaign');
  const [dialogContext, setDialogContext] = useState<string>(''); // campaignId or adventureId
  const [newName, setNewName] = useState("");
  
  const [openCampaigns, setOpenCampaigns] = useState<string[]>([]);
  const [openAdventures, setOpenAdventures] = useState<string[]>([]);

  const providers = ['DeepSeek', 'Gemini'];

  useEffect(() => {
    if (campaigns) {
      setOpenCampaigns(campaigns.map(c => c.id));
      const activeAdventure = getActiveAdventure();
      if (activeAdventure) {
        setOpenAdventures(prev => [...new Set([...prev, activeAdventure.id])]);
      }
    }
  }, [campaigns, activeSessionId, getActiveAdventure]);

  const openDialog = (mode: 'campaign' | 'session', context = '') => {
    setDialogMode(mode);
    setDialogContext(context);
    setNewName("");
    setDialogOpen(true);
  };

  const handleCreate = () => {
    if (newName.trim()) {
      if (dialogMode === 'campaign') addCampaign(newName.trim());
      else if (dialogMode === 'session') addSession(dialogContext, newName.trim());
      setDialogOpen(false);
    }
  };

  const handleResetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getDialogTitle = () => {
    if (dialogMode === 'campaign') return 'Crear Nueva Campaña';
    return 'Crear Nueva Sesión';
  };

  return (
    <>
      <div className="hidden lg:flex h-full max-h-screen flex-col gap-2 bg-background p-4 text-foreground border-r border-border">
        <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6">
          <h1 className="text-xl font-semibold text-foreground">Matrix RP</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-2 text-sm font-medium">
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
                  <div className="flex items-center w-full rounded-md hover:bg-accent/50 group">
                    <AccordionTrigger className="flex-1 px-3 py-2 text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4" />
                        <span>{campaign.name}</span>
                      </div>
                    </AccordionTrigger>
                    <ManageAdventure campaignId={campaign.id}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Nueva Aventura</span>
                      </Button>
                    </ManageAdventure>
                  </div>
                  <AccordionContent className="pl-4 pt-1">
                    <Accordion type="multiple" className="w-full" value={openAdventures} onValueChange={setOpenAdventures}>
                      {(campaign.adventures || []).map((adventure) => (
                        <AccordionItem key={adventure.id} value={adventure.id} className="border-b-0">
                          <div className="flex items-center w-full rounded-md hover:bg-accent/50 group">
                            <AccordionTrigger className="flex-1 px-3 py-2 text-left hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Briefcase className="h-4 w-4" />
                                <span>{adventure.name}</span>
                              </div>
                            </AccordionTrigger>
                            <ManageAdventure adventure={adventure}>
                               <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar Aventura</span>
                              </Button>
                            </ManageAdventure>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                              onClick={(e) => { e.stopPropagation(); openDialog('session', adventure.id); }}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Nueva Sesión</span>
                            </Button>
                          </div>
                          <AccordionContent className="pl-4 pt-1">
                            {(adventure.sessions || []).map((session) => (
                              <a key={session.id} href="#" onClick={(e) => { e.preventDefault(); setActiveSessionId(session.id); }}
                                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                  activeSessionId === session.id ? "bg-accent text-accent-foreground" : "text-foreground")}>
                                <MessageSquare className="h-4 w-4" />{session.name}
                              </a>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-4 flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground">Personajes (PJs)</span>
              <ManagePcs>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Crear Personaje</span>
                </Button>
              </ManagePcs>
            </div>
            {playerCharacters.map((pc) => (
              <div key={pc.id} className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
                <div className="flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-foreground">
                  <User className="h-4 w-4" />
                  <span className="truncate flex-1">{pc.name}</span>
                </div>
                <ManagePcs pc={pc}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar Personaje</span>
                  </Button>
                </ManagePcs>
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground">Narradores (IA)</span>
              <ManageNarrators>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Crear Narrador</span>
                </Button>
              </ManageNarrators>
            </div>
            {narrators.map((narrator) => (
              <div key={narrator.id} className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveNarrator(narrator.id); }}
                  className={cn("flex-1 flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    activeNarrator.id === narrator.id ? "bg-accent text-accent-foreground" : "text-foreground group-hover:text-primary")}>
                  <Sparkles className="h-4 w-4" />
                  <span className="truncate flex-1">{narrator.name}</span>
                </a>
                <ManageNarrators narrator={narrator}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar Narrador</span>
                  </Button>
                </ManageNarrators>
              </div>
            ))}

            <div className="mt-4 px-3 py-2 text-xs font-semibold text-muted-foreground">Proveedores de IA</div>
            {providers.map((provider) => (
              <a key={provider} href="#" onClick={(e) => { e.preventDefault(); setActiveProvider(provider); }}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  activeProvider === provider ? "bg-accent text-accent-foreground" : "text-foreground")}>
                <Brain className="h-4 w-4" />{provider}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-border pt-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Restablecer Aplicación</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{getDialogTitle()}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Ingresa un nombre.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input placeholder="Nombre..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            className="bg-input text-foreground border-input focus-visible:ring-ring" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">Crear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción es irreversible. Se eliminarán todas tus campañas, aventuras, sesiones, personajes y narradores. La aplicación volverá a su estado inicial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetApp} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}