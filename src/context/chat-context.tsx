"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Preset {
  temperature: number;
  maxLength: number;
  tone: string;
}

interface CustomGpt extends Preset {
  id: string;
  name: string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  activeProject: string;
  setActiveProject: (project: string) => void;
  currentPreset: Preset;
  setCurrentPreset: (preset: Preset) => void;
  activeGpt: CustomGpt;
  setActiveGpt: (gptId: string) => void;
  customGpts: CustomGpt[];
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek'); // Proveedor por defecto
  const [activeProject, setActiveProject] = useState<string>('Proyecto Alpha'); // Proyecto por defecto

  const customGpts: CustomGpt[] = [
    {
      id: 'general-assistant',
      name: 'Asistente General',
      description: 'Un asistente versátil para tareas cotidianas.',
      temperature: 0.7,
      maxLength: 500,
      tone: 'neutral',
    },
    {
      id: 'code-helper',
      name: 'Asistente de Código',
      description: 'Optimizado para generar y depurar código.',
      temperature: 0.5,
      maxLength: 1000,
      tone: 'technical',
    },
    {
      id: 'creative-writer',
      name: 'Redactor Creativo',
      description: 'Ideal para brainstorming y escritura creativa.',
      temperature: 0.9,
      maxLength: 750,
      tone: 'imaginative',
    },
  ];

  const [activeGpt, setActiveGptState] = useState<CustomGpt>(customGpts[0]);
  const [currentPreset, setCurrentPreset] = useState<Preset>(customGpts[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?', timestamp: new Date() },
    { id: '2', role: 'user', content: 'Necesito una interfaz de chat estilo Matrix.', timestamp: new Date() },
  ]);

  const setActiveGpt = (gptId: string) => {
    const selectedGpt = customGpts.find(gpt => gpt.id === gptId);
    if (selectedGpt) {
      setActiveGptState(selectedGpt);
      setCurrentPreset({
        temperature: selectedGpt.temperature,
        maxLength: selectedGpt.maxLength,
        tone: selectedGpt.tone,
      });
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple ID para demostración
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <ChatContext.Provider value={{
      activeProvider,
      setActiveProvider,
      activeProject,
      setActiveProject,
      currentPreset,
      setCurrentPreset,
      activeGpt,
      setActiveGpt,
      customGpts,
      messages,
      addMessage,
    }}>
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