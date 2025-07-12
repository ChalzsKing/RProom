"use client";

import React, { useState } from 'react';
import { Folder, Brain, PlusCircle, MessageSquare } from 'lucide-react';
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
    activeChatId, 
    setActiveChatId, 
    chats, 
    addChat 
  } = useChat();
  
  const [newChatName, setNewChatName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const providers = ['DeepSeek', 'Gemini'];

  const handleAddChat = () => {
    if (newChatName.trim()) {
      addChat(newChatName.trim());
      setNewChatName("");
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
              Conversaciones
            </span>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-sidebar-primary">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Nueva Conversación</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-sidebar border-sidebar-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sidebar-primary-foreground">Crear Nueva Conversación</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Ingresa un nombre para tu nueva conversación.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  placeholder="Ej: Ideas para mi novela..."
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddChat() }}
                  className="bg-input text-foreground border-input focus-visible:ring-ring"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddChat} className="bg-primary text-primary-foreground hover:bg-primary/90">Crear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {chats.map((chat) => (
            <a
              key={chat.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary",
                activeChatId === chat.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveChatId(chat.id);
              }}
            >
              <MessageSquare className="h-4 w-4" />
              {chat.name}
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