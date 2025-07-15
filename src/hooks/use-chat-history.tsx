"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './use-local-storage';
import { Message, Narrator } from '@/context/chat-context';

type ChatHistories = Record<string, Message[]>; // Keyed by session ID

const CHAT_HISTORY_STORAGE_KEY = 'rp_chat_histories';

export function useChatHistory() {
  const [chatHistories, setChatHistories, isChatHistoryLoaded] = useLocalStorage<ChatHistories>(CHAT_HISTORY_STORAGE_KEY, {});

  const getMessagesForSession = useCallback((sessionId: string | null) => {
    return sessionId ? chatHistories[sessionId] || [] : [];
  }, [chatHistories]);

  const addMessage = useCallback((sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = { ...message, id: Date.now().toString(), timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [sessionId]: [...(prev[sessionId] || []), newMessage] }));
  }, [setChatHistories]);

  const clearMessages = useCallback((sessionId: string, activeNarrator: Narrator) => {
    setChatHistories(prev => ({ ...prev, [sessionId]: [{
        id: '1', role: 'assistant', content: 'La sesión ha sido reiniciada.', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
    }] }));
    toast.info('Sesión reiniciada.');
  }, [setChatHistories]);

  const deleteSessionHistory = useCallback((sessionIds: string[]) => {
    setChatHistories(prev => {
      const newHistories = { ...prev };
      sessionIds.forEach(id => {
        delete newHistories[id];
      });
      return newHistories;
    });
  }, [setChatHistories]);

  const initializeSessionHistory = useCallback((sessionId: string, activeNarrator: Narrator) => {
    setChatHistories(prev => {
      if (!prev[sessionId]) {
        return {
          ...prev,
          [sessionId]: [{
            id: '1', role: 'assistant', content: 'La aventura comienza...', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
          }]
        };
      }
      return prev;
    });
  }, [setChatHistories]);

  return {
    chatHistories,
    setChatHistories, // Expose setChatHistories for initial load/reset logic in ChatProvider
    isChatHistoryLoaded,
    getMessagesForSession,
    addMessage,
    clearMessages,
    deleteSessionHistory,
    initializeSessionHistory,
  };
}