"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useNarrators } from '@/hooks/use-narrators';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useSceneStates } from '@/hooks/use-scene-states';

// ... (type definitions remain unchanged) ...

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const initializedRef = useRef(false);

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

  // Combine all loaded states
  const isLoaded = isCampaignsLoaded && isNarratorsLoaded && isChatHistoryLoaded && isSceneStatesLoaded;

  // Derived state and getters
  const getActiveCampaign = useCallback(() => {
    if (!activeSessionId) return undefined;
    return campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionId)));
  }, [campaigns, activeSessionId]);

  const getActiveAdventure = useCallback(() => {
    if (!activeSessionId) return undefined;
    const campaign = getActiveCampaign();
    return campaign?.adventures.find(a => a.sessions.some(s => s.id === activeSessionId));
  }, [activeSessionId, getActiveCampaign]);

  const getActiveSession = useCallback(() => {
    if (!activeSessionId) return undefined;
    const adventure = getActiveAdventure();
    return adventure?.sessions.find(s => s.id === activeSessionId);
  }, [activeSessionId, getActiveAdventure]);

  const messages = getMessagesForSession(activeSessionId);

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
    if (activeSessionId && deletedSessionIds?.includes(activeSessionId)) {
      const firstAvailableSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      setActiveSessionId(firstAvailableSessionId || null);
    }
  }, [deleteCampaignHook, deleteSessionHistory, activeSessionId, campaigns]);

  // Initialize active session and chat history on first load
  useEffect(() => {
    if (!initializedRef.current && isLoaded && campaigns.length > 0 && activeNarrator) {
      initializedRef.current = true;
      
      const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId) {
        setActiveSessionId(firstSessionId);
        initializeSessionHistory(firstSessionId, activeNarrator);
      }
    }
  }, [isLoaded, campaigns, activeNarrator, initializeSessionHistory]);

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
      activeSessionId,
      setActiveSessionId,
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