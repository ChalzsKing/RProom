"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react'; // Import useMemo
import { LoadingScreen } from '@/components/loading-screen';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useNarrators } from '@/hooks/use-narrators';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useSceneStates } from '@/hooks/use-scene-states';

// Type Definitions (assuming these are already defined correctly elsewhere or will be added)
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  authorId: string; // ID of the speaker (narrator, PC, NPC)
  authorName: string; // Name of the speaker
}

export interface Narrator {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxLength: number;
  tone: string;
}

export interface Session {
  id: string;
  name: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  description: string;
}

export interface NonPlayerCharacter {
  id: string;
  name: string;
  description: string;
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
  keyLeaders?: string;
  relationships?: string;
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
  properties?: string;
}

export interface HouseRule {
  id: string;
  title: string;
  rule: string;
}

export type SceneControl = 'player' | 'ai' | 'absent';
export type SceneStates = Record<string, Record<string, SceneControl>>; // sessionId -> characterId -> control

export interface Campaign {
  id: string;
  name: string;
  worldDescription: string;
  uniqueFeatures?: string;
  worldTone: string;
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
  nonPlayerCharacters: NonPlayerCharacter[]; // Adventure-specific NPCs
  campaignNpcs: NonPlayerCharacter[]; // Campaign-wide NPCs
  locations: Location[];
  factions: Faction[];
  glossary: GlossaryTerm[];
  importantItems: ImportantItem[];
  houseRules: HouseRule[];
}

interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  campaigns: Campaign[];
  addCampaign: (name: string) => void;
  updateCampaign: (campaignId: string, campaignData: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters' | 'locations' | 'factions' | 'glossary' | 'importantItems' | 'houseRules'>>) => void;
  deleteCampaign: (campaignId: string) => void;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  narrators: Narrator[];
  activeNarrator: Narrator;
  setActiveNarrator: (narratorId: string) => void;
  addNarrator: (narratorData: Omit<Narrator, 'id'>) => void;
  updateNarrator: (narratorId: string, narratorData: Omit<Narrator, 'id'>) => void;
  playerCharacters: PlayerCharacter[];
  addPlayerCharacter: (campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;
  updatePlayerCharacter: (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;
  deletePlayerCharacter: (campaignId: string, pcId: string) => void; // Added this
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
  addAdventure: (campaignId: string, adventureData: { name: string; premise: string }) => void;
  updateAdventure: (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => void;
  addSession: (adventureId: string, sessionName: string) => Session;
  getCampaignById: (campaignId: string) => Campaign | undefined;
  getActiveCampaign: () => Campaign | undefined;
  getActiveAdventure: () => Adventure | undefined;
  getActiveSession: () => Session | undefined;
  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
  populateCampaignFromAI: (campaignId: string, worldData: any) => void; // Add new function
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Load all data hooks
  const campaignsData = useCampaigns();
  const narratorsData = useNarrators();
  const chatHistoryData = useChatHistory();
  const sceneStatesData = useSceneStates();

  // Destructure after all hooks are called
  const {
    campaigns, setCampaigns, isCampaignsLoaded,
    addCampaign, updateCampaign, deleteCampaign: deleteCampaignHook, 
    addAdventure, updateAdventure, addSession,
    addPlayerCharacter, updatePlayerCharacter, deletePlayerCharacter, // Added deletePlayerCharacter
    addNonPlayerCharacter, updateNonPlayerCharacter, deleteNonPlayerCharacter,
    addCampaignNpc, updateCampaignNpc, deleteCampaignNpc,
    addLocation, updateLocation, deleteLocation,
    addFaction, updateFaction, deleteFaction,
    addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
    addImportantItem, updateImportantItem, deleteImportantItem,
    addHouseRule, updateHouseRule, deleteHouseRule,
    populateCampaignFromAI, // Get new function
  } = campaignsData;

  const {
    narrators, setNarrators, isNarratorsLoaded,
    activeNarrator, setActiveNarrator, addNarrator, updateNarrator,
  } = narratorsData;

  const {
    chatHistories, setChatHistories, isChatHistoryLoaded,
    getMessagesForSession, addMessage: addMessageHook, clearMessages: clearMessagesHook,
    deleteSessionHistory, initializeSessionHistory,
  } = chatHistoryData;

  const {
    sceneStates, setSceneStates, isSceneStatesLoaded,
    updateSceneState,
  } = sceneStatesData;

  // Combine all loaded states
  const isLoaded = isCampaignsLoaded && isNarratorsLoaded && isChatHistoryLoaded && isSceneStatesLoaded;

  // Helper functions to get active entities
  const getCampaignById = useCallback((campaignId: string) => {
    return campaigns.find(c => c.id === campaignId);
  }, [campaigns]);

  const getActiveCampaign = useCallback(() => {
    if (!activeSessionId) return undefined;
    for (const campaign of campaigns) {
      for (const adventure of campaign.adventures) {
        if (adventure.sessions.some(s => s.id === activeSessionId)) {
          return campaign;
        }
      }
    }
    return undefined;
  }, [activeSessionId, campaigns]);

  const getActiveAdventure = useCallback(() => {
    if (!activeSessionId) return undefined;
    const activeCampaign = getActiveCampaign();
    if (!activeCampaign) return undefined;
    for (const adventure of activeCampaign.adventures) {
      if (adventure.sessions.some(s => s.id === activeSessionId)) {
        return adventure;
      }
    }
    return undefined;
  }, [activeSessionId, getActiveCampaign]);

  const getActiveSession = useCallback(() => {
    if (!activeSessionId) return undefined;
    const activeAdventure = getActiveAdventure();
    if (!activeAdventure) return undefined;
    return activeAdventure.sessions.find(s => s.id === activeSessionId);
  }, [activeSessionId, getActiveAdventure]);

  // Messages for the active session
  const messages = getMessagesForSession(activeSessionId);

  // Memoize derived data to prevent unnecessary re-renders
  const activeCampaign = getActiveCampaign();
  const playerCharacters = useMemo(() => activeCampaign?.playerCharacters || [], [activeCampaign]);
  const nonPlayerCharacters = useMemo(() => activeCampaign?.nonPlayerCharacters || [], [activeCampaign]);
  const campaignNpcs = useMemo(() => activeCampaign?.campaignNpcs || [], [activeCampaign]);
  const locations = useMemo(() => activeCampaign?.locations || [], [activeCampaign]);
  const factions = useMemo(() => activeCampaign?.factions || [], [activeCampaign]);
  const glossary = useMemo(() => activeCampaign?.glossary || [], [activeCampaign]);
  const importantItems = useMemo(() => activeCampaign?.importantItems || [], [activeCampaign]);
  const houseRules = useMemo(() => activeCampaign?.houseRules || [], [activeCampaign]);

  // Wrapped addMessage and clearMessages to pass activeSessionId
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (activeSessionId) {
      addMessageHook(activeSessionId, message);
    }
  }, [activeSessionId, addMessageHook]);

  const clearMessages = useCallback(() => {
    if (activeSessionId && activeNarrator) {
      clearMessagesHook(activeSessionId, activeNarrator);
    }
  }, [activeSessionId, activeNarrator, clearMessagesHook]);

  // Handle campaign deletion and associated chat history cleanup
  const deleteCampaign = useCallback((campaignId: string) => {
    const sessionIdsToDelete = deleteCampaignHook(campaignId);
    if (sessionIdsToDelete && sessionIdsToDelete.length > 0) {
      deleteSessionHistory(sessionIdsToDelete);
      // If the active session was part of the deleted campaign, clear it
      if (activeSessionId && sessionIdsToDelete.includes(activeSessionId)) {
        setActiveSessionId(null);
      }
    }
  }, [deleteCampaignHook, deleteSessionHistory, activeSessionId]);

  // Initialize active session and chat history
  useEffect(() => {
    if (isLoaded && !initializedRef.current) {
      initializedRef.current = true;
      
      // Only initialize if we have campaigns but no active session
      if (campaigns.length > 0 && !activeSessionId) {
        const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
        if (firstSessionId && activeNarrator) { // Ensure activeNarrator is not null
          setActiveSessionId(firstSessionId);
          initializeSessionHistory(firstSessionId, activeNarrator);
        }
      }
    }
  }, [isLoaded, campaigns, activeSessionId, activeNarrator, initializeSessionHistory]);

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
      activeSessionId,
      setActiveSessionId,
      messages,
      addMessage,
      clearMessages,
      narrators,
      activeNarrator,
      setActiveNarrator,
      addNarrator,
      updateNarrator,
      playerCharacters,
      addPlayerCharacter,
      updatePlayerCharacter,
      deletePlayerCharacter, // Added this
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
      addAdventure,
      updateAdventure,
      addSession,
      getCampaignById,
      getActiveCampaign,
      getActiveAdventure,
      getActiveSession,
      sceneStates,
      updateSceneState,
      populateCampaignFromAI, // Pass new function
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