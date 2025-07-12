"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useChat } from '@/context/chat-context';

export function ChatWindow() {
  const { activeProvider, activeProject } = useChat();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:h-[60px] lg:px-6">
        <h2 className="text-lg font-semibold">
          Chat con {activeProvider} - {activeProject}
        </h2>
        {/* Aquí se podrían añadir botones para presets, exportar, etc. */}
      </header>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {/* Área de visualización de mensajes */}
        <div className="mb-4 p-2 rounded-md bg-secondary text-secondary-foreground">
          <span className="font-bold text-primary">IA:</span> ¡Hola! ¿En qué puedo ayudarte hoy?
        </div>
        <div className="mb-4 p-2 rounded-md bg-primary text-primary-foreground text-right">
          <span className="font-bold">Tú:</span> Necesito una interfaz de chat estilo Matrix.
        </div>
        {/* Más mensajes aquí */}
      </div>
      <div className="border-t border-border p-4 flex items-center gap-2">
        <Input
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-input text-foreground border-input focus-visible:ring-ring"
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </div>
  );
}