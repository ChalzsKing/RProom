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
    addPlayerCharacter, updatePlayerCharacter,
    addNonPlayerCharacter, updateNonPlayerCharacter, deleteNonPlayerCharacter,
    addCampaignNpc, updateCampaignNpc, deleteCampaignNpc,
    addLocation, updateLocation, deleteLocation,
    addFaction, updateFaction, deleteFaction,
    addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
    addImportantItem, updateImportantItem, deleteImportantItem,
    addHouseRule, updateHouseRule, deleteHouseRule,
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

  // Initialize active session and chat history
  useEffect(() => {
    if (isLoaded && !initializedRef.current) {
      initializedRef.current = true;
      
      // Only initialize if we have campaigns but no active session
      if (campaigns.length > 0 && !activeSessionId) {
        const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
        if (firstSessionId) {
          setActiveSessionId(firstSessionId);
          initializeSessionHistory(firstSessionId, activeNarrator);
        }
      }
    }
  }, [isLoaded, campaigns, activeSessionId, activeNarrator, initializeSessionHistory]);

  // ... (rest of the component remains unchanged, including all useCallbacks and derived values) ...

  if (!isLoaded || !activeNarrator) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      // ... (provider value remains unchanged) ...
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