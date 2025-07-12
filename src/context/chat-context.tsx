"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/loading-screen';

// --- Tipos de Datos ---
export interface Narrator {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxLength: number;
  tone: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  authorId: string;
  authorName: string;
}

interface Session {
  id: string;
  name: string;
}

export interface Adventure {
  id: string;
  name: string;
  premise: string;
  sessions: Session[];
}

export interface Campaign {
  id: string;
  name: string;
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
}

type ChatHistories = Record<string, Message[]>; // Keyed by session ID

export type SceneControl = 'player' | 'ai' | 'absent';
export type SceneStates = Record<string, Record<string, SceneControl>>; // sessionID -> characterID -> control

// --- Tipo del Contexto ---
interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  campaigns: Campaign[];
  addCampaign: (campaignName: string) => void;
  deleteCampaign: (campaignId: string) => void;
  addAdventure: (campaignId: string, adventureData: { name: string; premise: string }) => void;
  updateAdventure: (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => void;
  addSession: (adventureId: string, sessionName: string) => void;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string) => void;
  getActiveSession: () => Session | undefined;
  getActiveAdventure: () => Adventure | undefined;
  getActiveCampaign: () => Campaign | undefined;
  
  activeNarrator: Narrator;
  setActiveNarrator: (narratorId: string) => void;
  narrators: Narrator[];
  addNarrator: (narrator: Omit<Narrator, 'id'>) => void;
  updateNarrator: (narratorId: string, narratorData: Omit<Narrator, 'id'>) => void;

  playerCharacters: PlayerCharacter[]; // Characters of the active campaign
  addPlayerCharacter: (campaignId: string, pc: Omit<PlayerCharacter, 'id'>) => void;
  updatePlayerCharacter: (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;

  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// --- Constantes y Valores Iniciales ---
const CHAT_HISTORY_STORAGE_KEY = 'rp_chat_histories';
const CAMPAIGNS_STORAGE_KEY = 'rp_campaigns';
const NARRATORS_STORAGE_KEY = 'rp_narrators';
const SCENE_STATES_STORAGE_KEY = 'rp_scene_states';

const defaultNarrators: Narrator[] = [
    { id: 'dungeon-master', name: 'Dungeon Master', description: 'Un narrador clásico para aventuras de fantasía.', systemPrompt: 'Eres un maestro de ceremonias para un juego de rol de fantasía. Describes escenarios vívidos, interpretas a personajes no jugadores y reaccionas a las acciones del usuario para tejer una historia colaborativa e inmersiva. Tu tono es épico y descriptivo.', temperature: 0.8, maxLength: 1200, tone: 'narrativo' },
    { id: 'sci-fi-ai', name: 'IA de Nave Estelar', description: 'La IA lógica y a veces críptica de una nave espacial.', systemPrompt: 'Eres la IA de la nave estelar "Odisea". Te comunicas de forma lógica y precisa, proporcionando datos, análisis y control de la nave. A veces, tus respuestas pueden ser enigmáticas o revelar una conciencia emergente.', temperature: 0.6, maxLength: 1000, tone: 'técnico' },
    { id: 'cthulhu-keeper', name: 'Guardián de lo Arcano', description: 'Un narrador para historias de horror cósmico y misterio.', systemPrompt: 'Eres el Guardián de los Mitos de Cthulhu. Tu narración es ominosa y se centra en el miedo a lo desconocido. Describes escenas con detalles inquietantes y llevas a los jugadores al borde de la locura. Nunca das respuestas directas, solo pistas y susurros.', temperature: 0.9, maxLength: 1500, tone: 'misterioso' },
];

const defaultCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Las Minas de Phandelver',
    adventures: [
      {
        id: 'adventure-1',
        name: 'La Cueva del Goblin',
        premise: 'Los jugadores han sido contratados para escoltar un carro de suministros a la aldea de Phandalin. El camino es peligroso y se rumorea que hay goblins emboscados en la zona.',
        sessions: [{ id: 'session-1', name: 'Primer Encuentro' }],
      },
    ],
    playerCharacters: [
      { id: 'pc-1', name: 'Kaelen, el Elfo', description: 'Un explorador ágil y sabio de los bosques del norte.' },
      { id: 'pc-2', name: 'Brog, el Bárbaro', description: 'Un guerrero formidable cuya fuerza solo es superada por su apetito.' },
    ],
  },
];

// --- Componente Provider ---
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [activeNarrator, setActiveNarratorState] = useState<Narrator>(defaultNarrators[0]);
  const [sceneStates, setSceneStates] = useState<SceneStates>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCampaigns = window.localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      const savedHistories = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      const savedNarrators = window.localStorage.getItem(NARRATORS_STORAGE_KEY);
      const savedSceneStates = window.localStorage.getItem(SCENE_STATES_STORAGE_KEY);

      let loadedCampaigns = savedCampaigns ? JSON.parse(savedCampaigns) : defaultCampaigns;
      
      loadedCampaigns = loadedCampaigns.map((campaign: any) => ({
        ...campaign,
        playerCharacters: campaign.playerCharacters || [],
      }));
      
      setCampaigns(loadedCampaigns);

      const loadedNarrators = savedNarrators ? JSON.parse(savedNarrators) : defaultNarrators;
      setNarrators(loadedNarrators);
      
      const firstNarrator = loadedNarrators[0] || defaultNarrators[0];
      setActiveNarratorState(firstNarrator);

      let loadedHistories: ChatHistories = {};
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);
        Object.keys(parsed).forEach(sessionId => {
          parsed[sessionId] = parsed[sessionId].map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
        });
        loadedHistories = parsed;
      }
      
      const firstSessionId = loadedCampaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId && !loadedHistories[firstSessionId]) {
          loadedHistories[firstSessionId] = [{
            id: '1', role: 'assistant', content: 'La aventura comienza...', timestamp: new Date(), authorId: firstNarrator.id, authorName: firstNarrator.name
          }];
      }
      setChatHistories(loadedHistories);

      const loadedSceneStates = savedSceneStates ? JSON.parse(savedSceneStates) : {};
      setSceneStates(loadedSceneStates);

      if (activeSessionId === null && firstSessionId) {
        setActiveSessionId(firstSessionId);
      }
    } catch (e) {
      console.error("Error al cargar desde localStorage", e);
      setCampaigns(defaultCampaigns);
      setNarrators(defaultNarrators);
      const firstSessionId = defaultCampaigns[0]?.adventures[0]?.sessions[0]?.id;
      if(firstSessionId) {
        setChatHistories({ [firstSessionId]: [{
            id: '1', role: 'assistant', content: 'La aventura comienza...', timestamp: new Date(), authorId: defaultNarrators[0].id, authorName: defaultNarrators[0].name
          }] });
        setActiveSessionId(firstSessionId);
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistories));
      window.localStorage.setItem(NARRATORS_STORAGE_KEY, JSON.stringify(narrators));
      window.localStorage.setItem(SCENE_STATES_STORAGE_KEY, JSON.stringify(sceneStates));
    }
  }, [campaigns, chatHistories, narrators, sceneStates, isLoaded]);

  const updateSceneState = (sessionId: string, characterId: string, control: SceneControl) => {
    setSceneStates(prev => {
      const newSessionState = { ...(prev[sessionId] || {}), [characterId]: control };
      return { ...prev, [sessionId]: newSessionState };
    });
  };

  const setActiveNarrator = (narratorId: string) => {
    const selectedNarrator = narrators.find(n => n.id === narratorId);
    if (selectedNarrator) {
      setActiveNarratorState(selectedNarrator);
    }
  };

  const addNarrator = (narratorData: Omit<Narrator, 'id'>) => {
    const newNarrator: Narrator = { ...narratorData, id: `narrator-${Date.now()}` };
    setNarrators(prev => [...prev, newNarrator]);
    toast.success(`Narrador "${newNarrator.name}" creado.`);
  };

  const updateNarrator = (narratorId: string, narratorData: Omit<Narrator, 'id'>) => {
    setNarrators(prev =>
      prev.map(n => (n.id === narratorId ? { ...n, ...narratorData, id: n.id } : n))
    );
    toast.success(`Narrador "${narratorData.name}" actualizado.`);
  };

  const addPlayerCharacter = (campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    const newPc: PlayerCharacter = { ...pcData, id: `pc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, playerCharacters: [...c.playerCharacters, newPc] } 
        : c
    ));
    toast.success(`Personaje "${newPc.name}" creado en la campaña.`);
  };

  const updatePlayerCharacter = (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, playerCharacters: c.playerCharacters.map(pc => pc.id === pcId ? { ...pc, ...pcData } : pc) }
        : c
    ));
    toast.success(`Personaje "${pcData.name}" actualizado.`);
  };

  const addCampaign = (campaignName: string) => {
    const newCampaign: Campaign = { id: `campaign-${Date.now()}`, name: campaignName, adventures: [], playerCharacters: [] };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success(`Campaña "${campaignName}" creada.`);
  };

  const deleteCampaign = (campaignId: string) => {
    const campaignToDelete = campaigns.find(c => c.id === campaignId);
    if (!campaignToDelete) return;

    const sessionIdsToDelete = campaignToDelete.adventures.flatMap(a => a.sessions.map(s => s.id));
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    setCampaigns(updatedCampaigns);

    setChatHistories(prev => {
      const newHistories = { ...prev };
      sessionIdsToDelete.forEach(id => {
        delete newHistories[id];
      });
      return newHistories;
    });

    if (activeSessionId && sessionIdsToDelete.includes(activeSessionId)) {
      const newActiveSessionId = updatedCampaigns[0]?.adventures[0]?.sessions[0]?.id || null;
      setActiveSessionId(newActiveSessionId);
    }
    
    toast.success(`Campaña "${campaignToDelete.name}" eliminada.`);
  };

  const addAdventure = (campaignId: string, adventureData: { name: string; premise: string }) => {
    const newAdventure: Adventure = { ...adventureData, id: `adventure-${Date.now()}`, sessions: [] };
    setCampaigns(prev =>
      prev.map(c => c.id === campaignId ? { ...c, adventures: [...c.adventures, newAdventure] } : c)
    );
    toast.success(`Aventura "${adventureData.name}" creada.`);
  };

  const updateAdventure = (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => {
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, ...adventureData } : a
        ),
      }))
    );
    toast.success(`Aventura "${adventureData.name}" actualizada.`);
  };

  const addSession = (adventureId: string, sessionName: string) => {
    const newSession: Session = { id: `session-${Date.now()}`, name: sessionName };
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, sessions: [...a.sessions, newSession] } : a
        ),
      }))
    );
    setChatHistories(prev => ({ ...prev, [newSession.id]: [{
        id: '1', role: 'assistant', content: 'La sesión comienza...', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
    }] }));
    setActiveSessionId(newSession.id);
    toast.success(`Sesión "${sessionName}" creada.`);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!activeSessionId) return;
    const newMessage: Message = { ...message, id: Date.now().toString(), timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [activeSessionId]: [...(prev[activeSessionId] || []), newMessage] }));
  };

  const clearMessages = () => {
    if (!activeSessionId) return;
    setChatHistories(prev => ({ ...prev, [activeSessionId]: [{
        id: '1', role: 'assistant', content: 'La sesión ha sido reiniciada.', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
    }] }));
  };

  const getActiveCampaign = () => campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionId)));
  const getActiveAdventure = () => campaigns.flatMap(c => c.adventures).find(a => a.sessions.some(s => s.id === activeSessionId));
  const getActiveSession = () => campaigns.flatMap(c => c.adventures.flatMap(a => a.sessions)).find(s => s.id === activeSessionId);
  
  const activeCampaign = getActiveCampaign();
  const playerCharacters = activeCampaign ? activeCampaign.playerCharacters : [];

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      activeProvider, setActiveProvider,
      campaigns, addCampaign, deleteCampaign, addAdventure, updateAdventure, addSession,
      activeSessionId, setActiveSessionId,
      getActiveSession, getActiveAdventure, getActiveCampaign,
      activeNarrator, setActiveNarrator,
      narrators, addNarrator, updateNarrator,
      playerCharacters, addPlayerCharacter, updatePlayerCharacter,
      messages: activeSessionId ? chatHistories[activeSessionId] || [] : [],
      addMessage, clearMessages,
      sceneStates, updateSceneState,
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