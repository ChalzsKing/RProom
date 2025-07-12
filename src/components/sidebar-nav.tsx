import React from 'react';
import { Folder, Brain } from 'lucide-react';

export function SidebarNav() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-sidebar p-4 text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
        <h1 className="text-xl font-semibold text-sidebar-primary-foreground">Matrix AI</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-2 text-sm font-medium">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            Carpetas de Proyectos
          </div>
          <a
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary"
            href="#"
          >
            <Folder className="h-4 w-4" />
            Proyecto Alpha
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary"
            href="#"
          >
            <Folder className="h-4 w-4" />
            Cliente Beta
          </a>
          <div className="mt-4 px-3 py-2 text-xs font-semibold text-muted-foreground">
            Proveedores de IA
          </div>
          <a
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary"
            href="#"
          >
            <Brain className="h-4 w-4" />
            DeepSeek
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary"
            href="#"
          >
            <Brain className="h-4 w-4" />
            Gemini
          </a>
        </nav>
      </div>
    </div>
  );
}