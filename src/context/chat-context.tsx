"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/loading-screen';

// --- Tipos de Datos ---
interface Preset {
  temperature: number;
  maxLength: number;
  tone: string;
}

export interface CustomGpt extends Preset {
  id: string;
  name:string;
  description: string;
  systemPrompt: string;
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

interface Project {
  id: string;
  name: string;
  chats: Chat[];
}

interface Folder {
  id: string;
  name: string;
  projects: Project[];
}

type ChatHistories = Record<string, Message[]>; // Keyed by chat ID

// --- Tipo del Contexto ---
interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  folders: Folder[];
  addFolder: (folderName: string) => void;
  addProject: (folderId: string, projectName: string) => void;
  addChat: (projectId: string, chatName: string) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string) => void;
  getActiveChat: () => Chat | undefined;
  getActiveProject: () => Project | undefined;
  getActiveFolder: () => Folder | undefined;
  currentPreset: Preset;
  setCurrentPreset: (preset: Preset) => void;
  activeGpt: CustomGpt;
  setActiveGpt: (gptId: string) => void;
  customGpts: CustomGpt[];
  addCustomGpt: (gpt: Omit<CustomGpt, 'id'>) => void;
  updateCustomGpt: (gptId: string, gptData: Omit<CustomGpt, 'id' | 'systemPrompt'> & { systemPrompt: string }) => void;
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// --- Constantes y Valores Iniciales ---
const initialMessage: Message = { id: '1', role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?', timestamp: new Date() };
const CHAT_HISTORY_STORAGE_KEY = 'matrix_ai_chat_histories';
const FOLDERS_STORAGE_KEY = 'matrix_ai_folders';
const CUSTOM_GPTS_STORAGE_KEY = 'matrix_ai_custom_gpts';

const defaultGpts: CustomGpt[] = [
    { id: 'general-assistant', name: 'Asistente General', description: 'Un asistente versátil para tareas cotidianas.', systemPrompt: 'Eres un asistente de IA general, útil y amigable.', temperature: 0.7, maxLength: 500, tone: 'neutral' },
    { id: 'code-helper', name: 'Asistente de Código', description: 'Optimizado para generar y depurar código.', systemPrompt: 'Eres un programador experto. Proporciona código claro, eficiente y bien documentado. Piensa paso a paso y explica tus soluciones.', temperature: 0.5, maxLength: 1500, tone: 'técnico' },
    { id: 'creative-writer', name: 'Redactor Creativo', description: 'Ideal para brainstorming y escritura creativa.', systemPrompt: 'Eres un escritor creativo y un experto en brainstorming. Genera ideas originales, imaginativas y fuera de lo común.', temperature: 0.9, maxLength: 1000, tone: 'imaginativo' },
];

const defaultFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'General',
    projects: [
      {
        id: 'project-1',
        name: 'Tareas Diarias',
        chats: [{ id: 'chat-1', name: 'Conversación Inicial' }],
      },
    ],
  },
];

// --- Componente Provider ---
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [customGpts, setCustomGpts] = useState<CustomGpt[]>([]);
  const [activeGpt, setActiveGptState] = useState<CustomGpt>(defaultGpts[0]);
  const [currentPreset, setCurrentPreset] = useState<Preset>(defaultGpts[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedFolders = window.localStorage.getItem(FOLDERS_STORAGE_KEY);
      const savedHistories = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      const savedGpts = window.localStorage.getItem(CUSTOM_GPTS_STORAGE_KEY);

      const loadedFolders = savedFolders ? JSON.parse(savedFolders) : defaultFolders;
      setFolders(loadedFolders);

      const loadedGpts = savedGpts ? JSON.parse(savedGpts) : defaultGpts;
      setCustomGpts(loadedGpts);
      
      const firstGpt = loadedGpts[0] || defaultGpts[0];
      setActiveGptState(firstGpt);
      setCurrentPreset(firstGpt);

      let loadedHistories: ChatHistories = {};
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);
        Object.keys(parsed).forEach(chatId => {
          parsed[chatId] = parsed[chatId].map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
        });
        loadedHistories = parsed;
      }
      
      const firstChatId = loadedFolders[0]?.projects?.[0]?.chats?.[0]?.id;
      if (firstChatId && !loadedHistories[firstChatId]) {
          loadedHistories[firstChatId] = [initialMessage];
      }
      setChatHistories(loadedHistories);

      if (activeChatId === null && firstChatId) {
        setActiveChatId(firstChatId);
      }
    } catch (e) {
      console.error("Error al cargar desde localStorage", e);
      setFolders(defaultFolders);
      setCustomGpts(defaultGpts);
      const firstChatId = defaultFolders[0]?.projects[0]?.chats[0]?.id;
      if(firstChatId) {
        setChatHistories({ [firstChatId]: [initialMessage] });
        setActiveChatId(firstChatId);
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistories));
      window.localStorage.setItem(CUSTOM_GPTS_STORAGE_KEY, JSON.stringify(customGpts));
    }
  }, [folders, chatHistories, customGpts, isLoaded]);

  const setActiveGpt = (gptId: string) => {
    const selectedGpt = customGpts.find(gpt => gpt.id === gptId);
    if (selectedGpt) {
      setActiveGptState(selectedGpt);
      setCurrentPreset({ temperature: selectedGpt.temperature, maxLength: selectedGpt.maxLength, tone: selectedGpt.tone });
    }
  };

  const addCustomGpt = (gptData: Omit<CustomGpt, 'id'>) => {
    const newGpt: CustomGpt = { ...gptData, id: `gpt-${Date.now()}` };
    setCustomGpts(prev => [...prev, newGpt]);
    toast.success(`GPT Personalizado "${newGpt.name}" creado.`);
  };

  const updateCustomGpt = (gptId: string, gptData: Omit<CustomGpt, 'id' | 'systemPrompt'> & { systemPrompt: string }) => {
    setCustomGpts(prev =>
      prev.map(gpt => (gpt.id === gptId ? { ...gpt, ...gptData } : gpt))
    );
    toast.success(`GPT Personalizado "${gptData.name}" actualizado.`);
  };

  const addFolder = (folderName: string) => {
    if (folderName && !folders.some(f => f.name === folderName)) {
      const newFolder: Folder = { id: `folder-${Date.now()}`, name: folderName, projects: [] };
      setFolders(prev => [...prev, newFolder]);
      toast.success(`Carpeta "${folderName}" creada.`);
    } else {
      toast.error("El nombre de la carpeta ya existe o es inválido.");
    }
  };

  const addProject = (folderId: string, projectName: string) => {
    const projectExists = folders.flatMap(f => f.projects || []).some(p => p.name === projectName);
    if (projectName && !projectExists) {
      const newProject: Project = { id: `project-${Date.now()}`, name: projectName, chats: [] };
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === folderId ? { ...folder, projects: [...(folder.projects || []), newProject] } : folder
        )
      );
      toast.success(`Proyecto "${projectName}" creado.`);
    } else {
      toast.error("El nombre del proyecto ya existe o es inválido.");
    }
  };

  const addChat = (projectId: string, chatName: string) => {
    const chatNameExists = folders.flatMap(f => (f.projects || []).flatMap(p => p.chats || [])).some(c => c.name === chatName);
    if (chatName && !chatNameExists) {
      const newChat: Chat = { id: `chat-${Date.now()}`, name: chatName };
      setFolders(prevFolders =>
        prevFolders.map(folder => ({
          ...folder,
          projects: (folder.projects || []).map(project =>
            project.id === projectId ? { ...project, chats: [...(project.chats || []), newChat] } : project
          ),
        }))
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

  const getActiveChat = () => (folders || []).flatMap(f => (f.projects || []).flatMap(p => p.chats || [])).find(c => c.id === activeChatId);
  const getActiveProject = () => (folders || []).flatMap(f => f.projects || []).find(p => (p.chats || []).some(c => c.id === activeChatId));
  const getActiveFolder = () => (folders || []).find(f => (f.projects || []).some(p => (p.chats || []).some(c => c.id === activeChatId)));

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      activeProvider, setActiveProvider,
      folders, addFolder, addProject, addChat,
      activeChatId, setActiveChatId,
      getActiveChat, getActiveProject, getActiveFolder,
      currentPreset, setCurrentPreset,
      activeGpt, setActiveGpt,
      customGpts, addCustomGpt, updateCustomGpt,
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