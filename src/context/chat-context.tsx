"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useNarrators } from '@/hooks/use-narrators';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useSceneStates } from '@/hooks/use-scene-states';

// --- Type Definitions ---
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

interface Adventure {
  id: string;
  name: string;
  premise: string;
  sessions: Session[];
}

interface PlayerCharacter {
  id: string;
  name: string;
  description: string;
}

interface NonPlayerCharacter {
  id: string;
  name: string;
  description: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface Faction {
  id: string;
  name: string;
  description: string;
  keyLeaders?: string;
  relationships?: string;
}

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

interface ImportantItem {
  id: string;
  name: string;
  description: string;
  properties?: string;
}

interface HouseRule {
  id: string;
  title: string;
  rule: string;
}

interface Campaign {
  id: string;
  name: string;
  worldDescription: string;
  uniqueFeatures: string;
  worldTone: string;
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
  nonPlayerCharacters: NonPlayerCharacter[]; // Adventure-specific NPCs
  campaignNpcs: NonPlayerCharacter[]; // Campaign-wide recurrent NPCs
  locations: Location[];
  factions: Faction[];
  glossary: GlossaryTerm[];
  importantItems: ImportantItem[];
  houseRules: HouseRule[];
}

type SceneControl = 'player' | 'ai' | 'absent';
type SceneStates = Record<string, Record<string, SceneControl>>;

interface Narrator {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxLength: number;
  tone: string;
}

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  campaigns: Campaign[];
  addCampaign: (name: string) => void;
  updateCampaign: (campaignId: string, data: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters' | 'campaignNpcs' | 'locations' | 'factions' | 'glossary' | 'importantItems' | 'houseRules'>>) => void;
  deleteCampaign: (campaignId: string) => string[];
  addAdventure: (campaignId: string, adventureData: { name: string; premise: string }) => void;
  updateAdventure: (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => void;
  addSession: (adventureId: string, sessionName: string) => Session;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
  getActiveCampaign: () => Campaign | undefined;
  getActiveAdventure: () => Adventure | undefined;
  getActiveSession: () => Session | undefined;
  narrators: Narrator[];
  activeNarrator: Narrator;
  setActiveNarrator: (narratorId: string) => void;
  addNarrator: (narratorData: Omit<Narrator, 'id'>) => void;
  updateNarrator: (narratorId: string, narratorData: Omit<Narrator, 'id'>) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  playerCharacters: PlayerCharacter[];
  addPlayerCharacter: (campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;
  updatePlayerCharacter: (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;
  nonPlayerCharacters: NonPlayerCharacter[];
  addNonPlayerCharacter: (campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  updateNonPlayerCharacter: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  deleteNonPlayerCharacter: (campaignId: string, npcId: string) => void;
  campaignNpcs: NonPlayerCharacter[];
  addCampaignNpc: (campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  updateCampaignNpc: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  deleteCampaignNpc: (campaignId: string, npcId: string) => void;
  locations: Location[];
  addLocation: (campaignId: string, locationData: Omit<Location, 'id'>) => void;
  updateLocation: (campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => void;
  deleteLocation: (campaignId: string, locationId: string) => void;
  factions: Faction[];
  addFaction: (campaignId: string, factionData: Omit<Faction, 'id'>) => void;
  updateFaction: (campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => void;
  deleteFaction: (campaignId: string, factionId: string) => void;
  glossary: GlossaryTerm[];
  addGlossaryTerm: (campaignId: string, termData: Omit<GlossaryTerm, 'id'>) => void;
  updateGlossaryTerm: (campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => void;
  deleteGlossaryTerm: (campaignId: string, termId: string) => void;
  importantItems: ImportantItem[];
  addImportantItem: (campaignId: string, itemData: Omit<ImportantItem, 'id'>) => void;
  updateImportantItem: (campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => void;
  deleteImportantItem: (campaignId: string, itemId: string) => void;
  houseRules: HouseRule[];
  addHouseRule: (campaignId: string, ruleData: Omit<HouseRule, 'id'>) => void;
  updateHouseRule: (campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => void;
  deleteHouseRule: (campaignId: string, ruleId: string) => void;
  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null); // Renamed for clarity

  const {
    campaigns, setCampaigns, isCampaignsLoaded,
    addCampaign, updateCampaign, deleteCampaign: deleteCampaignHook, addAdventure, updateAdventure, addSession,
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

  // Derived state and getters
  const getActiveCampaign = useCallback(() => {
    if (!activeSessionIdState) return undefined; // Use activeSessionIdState here
    return campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionIdState)));
  }, [campaigns, activeSessionIdState]);

  const getActiveAdventure = useCallback(() => {
    if (!activeSessionIdState) return undefined; // Use activeSessionIdState here
    const campaign = getActiveCampaign();
    return campaign?.adventures.find(a => a.sessions.some(s => s.id === activeSessionIdState));
  }, [activeSessionIdState, getActiveCampaign]);

  const getActiveSession = useCallback(() => {
    if (!activeSessionIdState) return undefined; // Use activeSessionIdState here
    const adventure = getActiveAdventure();
    return adventure?.sessions.find(s => s.id === activeSessionIdState);
  }, [activeSessionIdState, getActiveAdventure]);

  const messages = getMessagesForSession(activeSessionIdState); // Use activeSessionIdState here

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (activeSessionIdState) { // Use activeSessionIdState here
      addMessageHook(activeSessionIdState, message);
    }
  }, [activeSessionIdState, addMessageHook]);

  const clearMessages = useCallback(() => {
    if (activeSessionIdState && activeNarrator) { // Use activeSessionIdState here
      clearMessagesHook(activeSessionIdState, activeNarrator);
    }
  }, [activeSessionIdState, activeNarrator, clearMessagesHook]);

  const playerCharacters = getActiveCampaign()?.playerCharacters || [];
  const nonPlayerCharacters = getActiveCampaign()?.nonPlayerCharacters || [];
  const campaignNpcs = getActiveCampaign()?.campaignNpcs || [];
  const locations = getActiveCampaign()?.locations || [];
  const factions = getActiveCampaign()?.factions || [];
  const glossary = getActiveCampaign()?.glossary || [];
  const importantItems = getActiveCampaign()?.importantItems || [];
  const houseRules = getActiveCampaign()?.houseRules || [];

  const deleteCampaign = useCallback((campaignId: string) => {
    const deletedSessionIds = deleteCampaignHook(campaignId);
    if (deletedSessionIds && deletedSessionIds.length > 0) {
      deleteSessionHistory(deletedSessionIds);
    }
    if (activeSessionIdState && deletedSessionIds?.includes(activeSessionIdState)) { // Use activeSessionIdState here
      // If the active session was deleted, try to set a new active session
      const firstAvailableSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      setActiveSessionIdState(firstAvailableSessionId || null); // Use activeSessionIdState here
    }
  }, [deleteCampaignHook, deleteSessionHistory, activeSessionIdState, campaigns]); // Use activeSessionIdState here


  const isLoaded = isCampaignsLoaded && isNarratorsLoaded && isChatHistoryLoaded && isSceneStatesLoaded;

  // Initialize active session and chat history on first load
  useEffect(() => {
    if (isLoaded && campaigns.length > 0 && activeNarrator && activeSessionIdState === null) {
      const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId) {
        setActiveSessionIdState(firstSessionId); // Use activeSessionIdState here
        initializeSessionHistory(firstSessionId, activeNarrator);
      }
    }
  }, [isLoaded, campaigns, activeNarrator, activeSessionIdState, initializeSessionHistory]); // activeSessionIdState is a dependency to ensure the effect reacts when it's null

  if (!isLoaded || !activeNarrator) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      activeProvider,
      setActiveProvider,
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      addAdventure,
      updateAdventure,
      addSession,
      activeSessionId: activeSessionIdState, // Provide the state value
      setActiveSessionId: setActiveSessionIdState, // Provide the state setter
      getActiveCampaign,
      getActiveAdventure,
      getActiveSession,
      narrators,
      activeNarrator,
      setActiveNarrator,
      addNarrator,
      updateNarrator,
      messages,
      addMessage,
      clearMessages,
      playerCharacters,
      addPlayerCharacter,
      updatePlayerCharacter,
      nonPlayerCharacters,
      addNonPlayerCharacter,
      updateNonPlayerCharacter,
      deleteNonPlayerCharacter,
      campaignNpcs,
      addCampaignNpc,
      updateCampaignNpc,
      deleteCampaignNpc,
      locations,
      addLocation,
      updateLocation,
      deleteLocation,
      factions,
      addFaction,
      updateFaction,
      deleteFaction,
      glossary,
      addGlossaryTerm,
      updateGlossaryTerm,
      deleteGlossaryTerm,
      importantItems,
      addImportantItem,
      updateImportantItem,
      deleteImportantItem,
      houseRules,
      addHouseRule,
      updateHouseRule,
      deleteHouseRule,
      sceneStates,
      updateSceneState,
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