"use client";

import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { SceneStates, SceneControl } from '@/context/chat-context';

const SCENE_STATES_STORAGE_KEY = 'rp_scene_states';

export function useSceneStates() {
  const [sceneStates, setSceneStates, isSceneStatesLoaded] = useLocalStorage<SceneStates>(SCENE_STATES_STORAGE_KEY, {});

  const updateSceneState = useCallback((sessionId: string, characterId: string, control: SceneControl) => {
    setSceneStates(prev => {
      const newSessionState = { ...(prev[sessionId] || {}), [characterId]: control };
      return { ...prev, [sessionId]: newSessionState };
    });
  }, [setSceneStates]);

  return {
    sceneStates,
    setSceneStates, // Expose setSceneStates for initial load/reset logic in ChatProvider
    isSceneStatesLoaded,
    updateSceneState,
  };
}