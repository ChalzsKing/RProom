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
  const initializedRef = useRef(false); // Track initialization status

  // ... (hook calls remain unchanged) ...

  // Initialize active session and chat history on first load
  useEffect(() => {
    // Only run once when data is loaded and not yet initialized
    if (!initializedRef.current && isLoaded && campaigns.length > 0 && activeNarrator) {
      initializedRef.current = true;
      
      const firstSessionId = campaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId) {
        setActiveSessionId(firstSessionId);
        initializeSessionHistory(firstSessionId, activeNarrator);
      }
    }
  }, [isLoaded, campaigns, activeNarrator, initializeSessionHistory]); // Removed activeSessionId dependency

  // ... (rest of the component remains unchanged) ...
};