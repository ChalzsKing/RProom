"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface Preset {
  temperature: number;
  maxLength: number;
  tone: string;
}

interface CustomGpt extends Preset {
  id: string;
  name:string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
}

type ChatHistories = Record<string, Message[]>; // Keyed by chat ID

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string) => void;
  chats: Chat[];
  addChat: (chatName: string) => void;
  getActiveChat: () => Chat | undefined;
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
const CHAT_HISTORY_STORAGE_KEY = 'matrix_ai_chat_histories';
const CHATS_STORAGE_KEY = 'matrix_ai_chats';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');

  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window === 'undefined') return [{ id: 'default', name: 'Conversación General' }];
    try {
      const saved = window.localStorage.getItem(CHATS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Conversación General' }];
    } catch (e) {
      console.error("Error al cargar chats desde localStorage", e);
      return [{ id: 'default', name: 'Conversación General' }];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(chats[0]?.id || null);

  const [chatHistories, setChatHistories] = useState<ChatHistories>(() => {
    let loadedHistories: ChatHistories = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(chatId => {
            parsed[chatId] = parsed[chatId].map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          });
          loadedHistories = parsed;
        }
      } catch (e) {
        console.error("Error al cargar el historial del chat desde localStorage", e);
      }
    }
    if (!loadedHistories[chats[0]?.id]) {
      loadedHistories[chats[0]?.id] = [initialMessage];
    }
    return loadedHistories;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistories));
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

  const addChat = (chatName: string) => {
    if (chatName && !chats.some(c => c.name === chatName)) {
      const newChat: Chat = { id: Date.now().toString(), name: chatName };
      const newChats = [...chats, newChat];
      setChats(newChats);
      setChatHistories(prev => ({
        ...prev,
        [newChat.id]: [initialMessage]
      }));
      setActiveChatId(newChat.id);
      toast.success(`Conversación "${chatName}" creada.`);
    } else {
      toast.error("El nombre de la conversación ya existe o es inválido.");
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    if (!activeChatId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setChatHistories(prevHistories => ({
      ...prevHistories,
      [activeChatId]: [...(prevHistories[activeChatId] || []), newMessage],
    }));
  };

  const clearMessages = () => {
    if (!activeChatId) return;
    setChatHistories(prevHistories => ({
      ...prevHistories,
      [activeChatId]: [initialMessage],
    }));
  };

  const getActiveChat = () => chats.find(c => c.id === activeChatId);

  return (
    <ChatContext.Provider value={{
      activeProvider,
      setActiveProvider,
      activeChatId,
      setActiveChatId,
      chats,
      addChat,
      getActiveChat,
      currentPreset,
      setCurrentPreset,
      activeGpt,
      setActiveGpt,
      customGpts,
      messages: activeChatId ? chatHistories[activeChatId] || [] : [],
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