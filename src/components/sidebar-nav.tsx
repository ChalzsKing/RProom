"use client";

import React, { useState } from 'react';
import { Folder, Brain, PlusCircle } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SidebarNav() {
  const { 
    activeProvider, 
    setActiveProvider, 
    activeProject, 
    setActiveProject, 
    projects, 
    addProject 
  } = useChat();
  
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const providers = ['DeepSeek', 'Gemini'];

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-sidebar p-4 text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
        <h1 className="text-xl font-semibold text-sidebar-primary-foreground">Matrix AI</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-2 text-sm font-medium">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Carpetas de Proyectos
            </span>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-sidebar-primary">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Nuevo Proyecto</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-sidebar border-sidebar-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sidebar-primary-foreground">Crear Nuevo Proyecto</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Ingresa un nombre para tu nueva carpeta de proyecto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  placeholder="Nombre del proyecto..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddProject() }}
                  className="bg-input text-foreground border-input focus-visible:ring-ring"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddProject} className="bg-primary text-primary-foreground hover:bg-primary/90">Crear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {projects.map((project) => (
            <a
              key={project}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary",
                activeProject === project
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveProject(project);
              }}
            >
              <Folder className="h-4 w-4" />
              {project}
            </a>
          ))}
          <div className="mt-4 px-3 py-2 text-xs font-semibold text-muted-foreground">
            Proveedores de IA
          </div>
          {providers.map((provider) => (
            <a
              key={provider}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary",
                activeProvider === provider
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveProvider(provider);
              }}
            >
              <Brain className="h-4 w-4" />
              {provider}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}