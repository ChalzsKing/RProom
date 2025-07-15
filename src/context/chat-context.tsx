"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useNarrators } from '@/hooks/use-narrators';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useSceneStates } from '@/hooks/use-scene-states';

// ... (keep all your existing type definitions)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const {
    campaigns, setCampaigns, isCampaignsLoaded,
    // ... other campaign hooks
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

  // Derived state
  const getActiveCampaign = () => campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionId)));
  // ... other derived state functions

  const isLoaded = isCampaignsLoaded && isNarratorsLoaded && isChatHistoryLoaded && isSceneStatesLoaded;

  // Initialize active session and chat history
  useEffect(() => {
    if (isLoaded && !initializedRef.current && campaigns.length > 0 && activeNarrator) {
      initializedRef.current = true;
      const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId) {
        setActiveSessionId(firstSessionId);
        initializeSessionHistory(firstSessionId, activeNarrator);
      }
    }
  }, [isLoaded, campaigns, activeNarrator, initializeSessionHistory]);

  // ... rest of your component implementation

  if (!isLoaded || !activeNarrator) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      // ... your context values
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