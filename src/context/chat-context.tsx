"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

// --- Tipos de Datos ---
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

interface Folder {
  id: string;
  name: string;
  chats: Chat[];
}

type ChatHistories = Record<string, Message[]>; // Keyed by chat ID

// --- Tipo del Contexto ---
interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  folders: Folder[];
  addFolder: (folderName: string) => void;
  addChat: (folderId: string, chatName: string) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string) => void;
  getActiveChat: () => Chat | undefined;
  getActiveFolder: () => Folder | undefined;
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

// --- Constantes y Valores Iniciales ---
const initialMessage: Message = { id: '1', role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?', timestamp: new Date() };
const CHAT_HISTORY_STORAGE_KEY = 'matrix_ai_chat_histories';
const FOLDERS_STORAGE_KEY = 'matrix_ai_folders';

const defaultFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'General',
    chats: [{ id: 'chat-1', name: 'Conversación Inicial' }],
  },
];

// --- Componente Provider ---
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');

  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window === 'undefined') return defaultFolders;
    try {
      const saved = window.localStorage.getItem(FOLDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultFolders;
    } catch (e) {
      console.error("Error al cargar carpetas desde localStorage", e);
      return defaultFolders;
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(folders[0]?.chats[0]?.id || null);

  const [chatHistories, setChatHistories] = useState<ChatHistories>(() => {
    let loadedHistories: ChatHistories = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(chatId => {
            parsed[chatId] = parsed[chatId].map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
          });
          loadedHistories = parsed;
        }
      } catch (e) { console.error("Error al cargar historial", e); }
    }
    if (!loadedHistories[folders[0]?.chats[0]?.id]) {
      loadedHistories[folders[0]?.chats[0]?.id] = [initialMessage];
    }
    return loadedHistories;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    }
  }, [folders]);

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
      setCurrentPreset({ temperature: selectedGpt.temperature, maxLength: selectedGpt.maxLength, tone: selectedGpt.tone });
    }
  };

  const addFolder = (folderName: string) => {
    if (folderName && !folders.some(f => f.name === folderName)) {
      const newFolder: Folder = { id: `folder-${Date.now()}`, name: folderName, chats: [] };
      setFolders(prev => [...prev, newFolder]);
      toast.success(`Carpeta "${folderName}" creada.`);
    } else {
      toast.error("El nombre de la carpeta ya existe o es inválido.");
    }
  };

  const addChat = (folderId: string, chatName: string) => {
    const folderExists = folders.some(f => f.id === folderId);
    const chatNameExists = folders.flatMap(f => f.chats).some(c => c.name === chatName);

    if (folderExists && chatName && !chatNameExists) {
      const newChat: Chat = { id: `chat-${Date.now()}`, name: chatName };
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === folderId ? { ...folder, chats: [...folder.chats, newChat] } : folder
        )
      );
      setChatHistories(prev => ({ ...prev, [newChat.id]: [initialMessage] }));
      setActiveChatId(newChat.id);
      toast.success(`Conversación "${chatName}" creada.`);
    } else {
      toast.error("El nombre de la conversación ya existe o es inválido.");
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    if (!activeChatId) return;
    const newMessage: Message = { id: Date.now().toString(), role, content, timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), newMessage] }));
  };

  const clearMessages = () => {
    if (!activeChatId) return;
    setChatHistories(prev => ({ ...prev, [activeChatId]: [initialMessage] }));
  };

  const getActiveChat = () => folders.flatMap(f => f.chats).find(c => c.id === activeChatId);
  const getActiveFolder = () => folders.find(f => f.chats.some(c => c.id === activeChatId));

  return (
    <ChatContext.Provider value={{
      activeProvider, setActiveProvider,
      folders, addFolder, addChat,
      activeChatId, setActiveChatId,
      getActiveChat, getActiveFolder,
      currentPreset, setCurrentPreset,
      activeGpt, setActiveGpt,
      customGpts,
      messages: activeChatId ? chatHistories[activeChatId] || [] : [],
      addMessage, clearMessages,
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