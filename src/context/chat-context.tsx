"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  activeProject: string;
  setActiveProject: (project: string) => void;
  currentPreset: {
    temperature: number;
    maxLength: number;
    tone: string;
  };
  setCurrentPreset: (preset: { temperature: number; maxLength: number; tone: string }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek'); // Proveedor por defecto
  const [activeProject, setActiveProject] = useState<string>('Proyecto Alpha'); // Proyecto por defecto
  const [currentPreset, setCurrentPreset] = useState({
    temperature: 0.7,
    maxLength: 500,
    tone: 'neutral',
  });

  return (
    <ChatContext.Provider value={{ activeProvider, setActiveProvider, activeProject, setActiveProject, currentPreset, setCurrentPreset }}>
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