"use client";

import React, { useState, useEffect } from 'react';
import { Folder, Briefcase, MessageSquare, PlusCircle, Plus, Brain } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SidebarNav() {
  const {
    activeProvider, setActiveProvider,
    folders, addFolder, addProject, addChat,
    activeChatId, setActiveChatId, getActiveProject
  } = useChat();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'folder' | 'project' | 'chat'>('folder');
  const [dialogContext, setDialogContext] = useState<string>(''); // folderId or projectId
  const [newName, setNewName] = useState("");
  
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [openProjects, setOpenProjects] = useState<string[]>([]);

  const providers = ['DeepSeek', 'Gemini'];

  useEffect(() => {
    if (folders) {
      setOpenFolders(folders.map(f => f.id));
      const activeProject = getActiveProject();
      if (activeProject) {
        setOpenProjects(prev => [...new Set([...prev, activeProject.id])]);
      }
    }
  }, [folders, activeChatId, getActiveProject]);

  const openDialog = (mode: 'folder' | 'project' | 'chat', context = '') => {
    setDialogMode(mode);
    setDialogContext(context);
    setNewName("");
    setDialogOpen(true);
  };

  const handleCreate = () => {
    if (newName.trim()) {
      if (dialogMode === 'folder') addFolder(newName.trim());
      else if (dialogMode === 'project') addProject(dialogContext, newName.trim());
      else if (dialogMode === 'chat') addChat(dialogContext, newName.trim());
      setDialogOpen(false);
    }
  };

  const getDialogTitle = () => {
    if (dialogMode === 'folder') return 'Crear Nueva Carpeta';
    if (dialogMode === 'project') return 'Crear Nuevo Proyecto';
    return 'Crear Nueva Conversación';
  };

  return (
    <>
      <div className="flex h-full max-h-screen flex-col gap-2 bg-sidebar p-4 text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
          <h1 className="text-xl font-semibold text-sidebar-primary-foreground">Matrix AI</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-2 text-sm font-medium">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground">Carpetas</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-sidebar-primary" onClick={() => openDialog('folder')}>
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Nueva Carpeta</span>
              </Button>
            </div>

            <Accordion type="multiple" className="w-full" value={openFolders} onValueChange={setOpenFolders}>
              {(folders || []).map((folder) => (
                <AccordionItem key={folder.id} value={folder.id} className="border-b-0">
                  <div className="flex items-center w-full rounded-md hover:bg-sidebar-accent/50 group">
                    <AccordionTrigger className="flex-1 px-3 py-2 text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4" />
                        <span>{folder.name}</span>
                      </div>
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openDialog('project', folder.id);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Nuevo Proyecto</span>
                    </Button>
                  </div>
                  <AccordionContent className="pl-4 pt-1">
                    <Accordion type="multiple" className="w-full" value={openProjects} onValueChange={setOpenProjects}>
                      {(folder.projects || []).map((project) => (
                        <AccordionItem key={project.id} value={project.id} className="border-b-0">
                          <div className="flex items-center w-full rounded-md hover:bg-sidebar-accent/50 group">
                            <AccordionTrigger className="flex-1 px-3 py-2 text-left hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Briefcase className="h-4 w-4" />
                                <span>{project.name}</span>
                              </div>
                            </AccordionTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openDialog('chat', project.id);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Nueva Conversación</span>
                            </Button>
                          </div>
                          <AccordionContent className="pl-4 pt-1">
                            {(project.chats || []).map((chat) => (
                              <a key={chat.id} href="#" onClick={(e) => { e.preventDefault(); setActiveChatId(chat.id); }}
                                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary",
                                  activeChatId === chat.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground")}>
                                <MessageSquare className="h-4 w-4" />{chat.name}
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

            <div className="mt-4 px-3 py-2 text-xs font-semibold text-muted-foreground">Proveedores de IA</div>
            {providers.map((provider) => (
              <a key={provider} href="#" onClick={(e) => { e.preventDefault(); setActiveProvider(provider); }}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary",
                  activeProvider === provider ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground")}>
                <Brain className="h-4 w-4" />{provider}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-sidebar border-sidebar-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sidebar-primary-foreground">{getDialogTitle()}</AlertDialogTitle>
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
    </>
  );
}