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
    addCampaign, deleteCampaign, addSession,
    activeSessionId, setActiveSessionId, getActiveAdventure,
    narrators = [], // Default empty array if undefined
    activeNarrator, setActiveNarrator,
  } = useChat();

  // ... rest of the component code ...

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
          {(campaigns || []).map((campaign) => ( // Added null check with || []
            <AccordionItem key={campaign.id} value={campaign.id} className="border-b-0">
              {/* ... rest of the campaign item JSX ... */}
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
        
        {(narrators || []).map((narrator) => ( // Added null check with || []
          <div key={narrator.id} className="flex items-center justify-between rounded-lg hover:bg-accent/50 group">
            {/* ... narrator item JSX ... */}
          </div>
        ))}

        {/* ... rest of the component ... */}
      </div>
    </>
  );
}