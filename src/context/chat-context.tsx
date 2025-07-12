"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  activeProject: string;
  setActiveProject: (project: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek'); // Proveedor por defecto
  const [activeProject, setActiveProject] = useState<string>('Proyecto Alpha'); // Proyecto por defecto

  return (
    <ChatContext.Provider value={{ activeProvider, setActiveProvider, activeProject, setActiveProject }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};