"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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

type ChatHistories = Record<string, Message[]>;

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
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessage: Message = { id: '1', role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?', timestamp: new Date() };
const initialHistories: ChatHistories = {
  'Proyecto Alpha': [initialMessage],
  'Cliente Beta': [initialMessage],
};
const STORAGE_KEY = 'matrix_ai_chat_histories';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeProject, setActiveProject] = useState<string>('Proyecto Alpha');
  
  const [chatHistories, setChatHistories] = useState<ChatHistories>(() => {
    // Cargar desde localStorage al inicio
    if (typeof window === 'undefined') {
      return initialHistories;
    }
    try {
      const savedHistories = window.localStorage.getItem(STORAGE_KEY);
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);
        // Convertir timestamps de string a Date
        Object.keys(parsed).forEach(project => {
          parsed[project] = parsed[project].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        });
        return parsed;
      }
    } catch (error) {
      console.error("Error al cargar el historial del chat desde localStorage", error);
    }
    return initialHistories;
  });

  // Guardar en localStorage cada vez que el historial cambie
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistories));
    } catch (error) {
      console.error("Error al guardar el historial del chat en localStorage", error);
    }
  }, [chatHistories]);

  const customGpts: CustomGpt[] = [
    { id: 'general-assistant', name: 'Asistente General', description: 'Un asistente versátil para tareas cotidianas.', temperature: 0.7, maxLength: 500, tone: 'neutral' },
    { id: 'code-helper', name: 'Asistente de Código', description: 'Optimizado para generar y depurar código.', temperature: 0.5, maxLength: 1000, tone: 'technical' },
    { id: 'creative-writer', name: 'Redactor Creativo', description: 'Ideal para brainstorming y escritura creativa.', temperature: 0.9, maxLength: 750, tone: 'imaginative' },
  ];

  const [activeGpt, setActiveGptState] = useState<CustomGpt>(customGpts[0]);
  const [currentPreset, setCurrentPreset] = useState<Preset>(customGpts[0]);

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
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setChatHistories(prevHistories => ({
      ...prevHistories,
      [activeProject]: [...(prevHistories[activeProject] || []), newMessage],
    }));
  };

  const clearMessages = () => {
    setChatHistories(prevHistories => ({
      ...prevHistories,
      [activeProject]: [initialMessage],
    }));
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
      messages: chatHistories[activeProject] || [],
      addMessage,
      clearMessages,
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