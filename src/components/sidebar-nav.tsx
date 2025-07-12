import React from 'react';
import { Folder, Brain } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const { activeProvider, setActiveProvider, activeProject, setActiveProject } = useChat();

  const projects = ['Proyecto Alpha', 'Cliente Beta'];
  const providers = ['DeepSeek', 'Gemini'];

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