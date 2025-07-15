"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useNarrators } from '@/hooks/use-narrators';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useSceneStates } from '@/hooks/use-scene-states';

// --- Tipos de Datos (mantener aquí para exportación global) ---
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

export type NonPlayerCharacter = PlayerCharacter;

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

export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  keyLeaders: string;
  relationships: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export interface ImportantItem {
  id: string;
  name: string;
  description: string;
  properties: string;
}

export interface HouseRule {
  id: string;
  title: string;
  rule: string;
}

export interface Campaign {
  id: string;
  name: string;
  worldDescription: string;
  uniqueFeatures: string;
  worldTone: string;
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
  nonPlayerCharacters: NonPlayerCharacter[];
  campaignNpcs: NonPlayerCharacter[];
  locations: Location[];
  factions: Faction[];
  glossary: GlossaryTerm[];
  importantItems: ImportantItem[];
  houseRules: HouseRule[];
}

export type SceneControl = 'player' | 'ai' | 'absent';
export type SceneStates = Record<string, Record<string, SceneControl>>;

// --- Tipo del Contexto ---
interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  campaigns: Campaign[];
  addCampaign: (campaignName: string) => void;
  updateCampaign: (campaignId: string, campaignData: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters' | 'locations' | 'factions' | 'glossary' | 'importantItems' | 'houseRules'>>) => void;
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

  playerCharacters: PlayerCharacter[];
  addPlayerCharacter: (campaignId: string, pc: Omit<PlayerCharacter, 'id'>) => void;
  updatePlayerCharacter: (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;

  nonPlayerCharacters: NonPlayerCharacter[];
  addNonPlayerCharacter: (campaignId: string, npc: Omit<NonPlayerCharacter, 'id'>) => void;
  updateNonPlayerCharacter: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  deleteNonPlayerCharacter: (campaignId: string, npcId: string) => void;

  campaignNpcs: NonPlayerCharacter[];
  addCampaignNpc: (campaignId: string, npc: Omit<NonPlayerCharacter, 'id'>) => void;
  updateCampaignNpc: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  deleteCampaignNpc: (campaignId: string, npcId: string) => void;

  locations: Location[];
  addLocation: (campaignId: string, location: Omit<Location, 'id'>) => void;
  updateLocation: (campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => void;
  deleteLocation: (campaignId: string, locationId: string) => void;

  factions: Faction[];
  addFaction: (campaignId: string, faction: Omit<Faction, 'id'>) => void;
  updateFaction: (campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => void;
  deleteFaction: (campaignId: string, factionId: string) => void;

  glossary: GlossaryTerm[];
  addGlossaryTerm: (campaignId: string, term: Omit<GlossaryTerm, 'id'>) => void;
  updateGlossaryTerm: (campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => void;
  deleteGlossaryTerm: (campaignId: string, termId: string) => void;

  importantItems: ImportantItem[];
  addImportantItem: (campaignId: string, item: Omit<ImportantItem, 'id'>) => void;
  updateImportantItem: (campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => void;
  deleteImportantItem: (campaignId: string, itemId: string) => void;

  houseRules: HouseRule[];
  addHouseRule: (campaignId: string, rule: Omit<HouseRule, 'id'>) => void;
  updateHouseRule: (campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => void;
  deleteHouseRule: (campaignId: string, ruleId: string) => void;

  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// --- Componente Provider ---
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const {
    campaigns, setCampaigns, isCampaignsLoaded,
    addCampaign, updateCampaign, deleteCampaign: deleteCampaignHook,
    addAdventure, updateAdventure, addSession: addSessionHook,
    addPlayerCharacter, updatePlayerCharacter,
    addNonPlayerCharacter, updateNonPlayerCharacter, deleteNonPlayerCharacter,
    addCampaignNpc, updateCampaignNpc, deleteCampaignNpc,
    addLocation, updateLocation, deleteLocation,
    addFaction, updateFaction, deleteFaction,
    addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
    addImportantItem, updateImportantItem, deleteImportantItem,
    addHouseRule, updateHouseRule, deleteHouseRule,
  } = useCampaigns();

  const {
    narrators, setNarrators, isNarratorsLoaded,
    activeNarrator, setActiveNarrator, addNarrator, updateNarrator,
  } = useNarrators();

  const {
    chatHistories, setChatHistories, isChatHistoryLoaded,
    getMessagesForSession, addMessage: addMessageHook, clearMessages: clearMessagesHook,
    deleteSessionHistory, initializeSessionHistory,
  } = useChatHistory();

  const {
    sceneStates, setSceneStates, isSceneStatesLoaded,
    updateSceneState,
  } = useSceneStates();

  // Derived state for active campaign, adventure, session
  const getActiveCampaign = () => campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionId)));
  const getActiveAdventure = () => campaigns.flatMap(c => c.adventures).find(a => a.sessions.some(s => s.id === activeSessionId));
  const getActiveSession = () => campaigns.flatMap(c => c.adventures.flatMap(a => a.sessions)).find(s => s.id === activeSessionId);
  
  const activeCampaign = getActiveCampaign();
  const playerCharacters = activeCampaign ? activeCampaign.playerCharacters : [];
  const nonPlayerCharacters = activeCampaign ? activeCampaign.nonPlayerCharacters : [];
  const campaignNpcs = activeCampaign ? activeCampaign.campaignNpcs : [];
  const locations = activeCampaign ? activeCampaign.locations : [];
  const factions = activeCampaign ? activeCampaign.factions : [];
  const glossary = activeCampaign ? activeCampaign.glossary : [];
  const importantItems = activeCampaign ? activeCampaign.importantItems : [];
  const houseRules = activeCampaign ? activeCampaign.houseRules : [];

  // Combined loading state
  const isLoaded = isCampaignsLoaded && isNarratorsLoaded && isChatHistoryLoaded && isSceneStatesLoaded;

  // Initialize active session and chat history on first load
  useEffect(() => {
    if (isLoaded && activeSessionId === null && campaigns.length > 0 && activeNarrator) { // Add activeNarrator check
      const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId) {
        setActiveSessionId(firstSessionId);
        initializeSessionHistory(firstSessionId, activeNarrator);
      }
    }
  }, [isLoaded, activeSessionId, campaigns, activeNarrator, initializeSessionHistory]);

  // Override addSession to also initialize chat history
  const addSession = (adventureId: string, sessionName: string) => {
    const newSession = addSessionHook(adventureId, sessionName);
    if (newSession) {
      setActiveSessionId(newSession.id);
      initializeSessionHistory(newSession.id, activeNarrator);
    }
  };

  // Override deleteCampaign to also clean up chat history
  const deleteCampaign = (campaignId: string) => {
    const sessionIdsToDelete = deleteCampaignHook(campaignId);
    if (sessionIdsToDelete && sessionIdsToDelete.length > 0) {
      deleteSessionHistory(sessionIdsToDelete);
    }
    // If the active session was deleted, set a new active session
    if (activeSessionId && sessionIdsToDelete?.includes(activeSessionId)) {
      const newActiveSessionId = campaigns[0]?.adventures[0]?.sessions[0]?.id || null;
      setActiveSessionId(newActiveSessionId);
    }
  };

  // Override addMessage to pass activeSessionId
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (activeSessionId) {
      addMessageHook(activeSessionId, message);
    }
  };

  // Override clearMessages to pass activeSessionId and activeNarrator
  const clearMessages = () => {
    if (activeSessionId) {
      clearMessagesHook(activeSessionId, activeNarrator);
    }
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      activeProvider, setActiveProvider,
      campaigns, addCampaign, updateCampaign, deleteCampaign, addAdventure, updateAdventure, addSession,
      activeSessionId, setActiveSessionId,
      getActiveSession, getActiveAdventure, getActiveCampaign,
      activeNarrator, setActiveNarrator,
      narrators, addNarrator, updateNarrator,
      playerCharacters, addPlayerCharacter, updatePlayerCharacter,
      nonPlayerCharacters, addNonPlayerCharacter, updateNonPlayerCharacter, deleteNonPlayerCharacter,
      campaignNpcs, addCampaignNpc, updateCampaignNpc, deleteCampaignNpc,
      locations, addLocation, updateLocation, deleteLocation,
      factions, addFaction, updateFaction, deleteFaction,
      glossary, addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
      importantItems, addImportantItem, updateImportantItem, deleteImportantItem,
      houseRules, addHouseRule, updateHouseRule, deleteHouseRule,
      messages: getMessagesForSession(activeSessionId),
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