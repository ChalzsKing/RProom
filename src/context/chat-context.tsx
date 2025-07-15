"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
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

type NonPlayerCharacter = PlayerCharacter;

interface Campaign {
  id: string;
  name: string;
  worldDescription: string;
  uniqueFeatures: string;
  worldTone: string;
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
  nonPlayerCharacters: NonPlayerCharacter[];
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
  // ... include all other context properties
  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
}

// Create the context with proper typing
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const initializedRef = useRef(false);

  // ... rest of your existing provider implementation

  return (
    <ChatContext.Provider value={{
      activeProvider,
      setActiveProvider,
      // ... include all other context values
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