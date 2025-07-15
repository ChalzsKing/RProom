"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './use-local-storage';
import { Narrator } from '@/context/chat-context';

const NARRATORS_STORAGE_KEY = 'rp_narrators';
const ACTIVE_NARRATOR_ID_KEY = 'rp_active_narrator_id';

const defaultNarrators: Narrator[] = [
    { id: 'dungeon-master', name: 'Dungeon Master', description: 'Un narrador clásico para aventuras de fantasía.', systemPrompt: 'Eres un maestro de ceremonias para un juego de rol de fantasía. Describes escenarios vívidos, interpretas a personajes no jugadores y reaccionas a las acciones del usuario para tejer una historia colaborativa e inmersiva. Tu tono es épico y descriptivo.', temperature: 0.8, maxLength: 1200, tone: 'narrativo' },
    { id: 'sci-fi-ai', name: 'IA de Nave Estelar', description: 'La IA lógica y a veces críptica de una nave espacial.', systemPrompt: 'Eres la IA de la nave estelar "Odisea". Te comunicas de forma lógica y precisa, proporcionando datos, análisis y control de la nave. A veces, tus respuestas pueden ser enigmáticas o revelar una conciencia emergente.', temperature: 0.6, maxLength: 1000, tone: 'técnico' },
    { id: 'cthulhu-keeper', name: 'Guardián de lo Arcano', description: 'Un narrador para historias de horror cósmico y misterio.', systemPrompt: 'Eres el Guardián de los Mitos de Cthulhu. Tu narración es ominosa y se centra en el miedo a lo desconocido. Describes escenas con detalles inquietantes y llevas a los jugadores al borde de la locura. Nunca das respuestas directas, solo pistas y susurros.', temperature: 0.9, maxLength: 1500, tone: 'misterioso' },
];

export function useNarrators() {
  const [narrators, setNarrators, isNarratorsLoaded] = useLocalStorage<Narrator[]>(
    NARRATORS_STORAGE_KEY, 
    defaultNarrators
  );
  
  // Initialize activeNarrator using a function, which runs only once on mount
  const [activeNarrator, setActiveNarratorState] = useState<Narrator | null>(() => {
    if (typeof window === 'undefined') return null; // Prevent localStorage access on SSR
    const activeId = localStorage.getItem(ACTIVE_NARRATOR_ID_KEY);
    // Use defaultNarrators for initial lookup, as `narrators` from useLocalStorage might not be loaded yet.
    const found = defaultNarrators.find(n => n.id === activeId);
    return found || defaultNarrators[0];
  });

  // Effect to sync activeNarrator with loaded narrators from localStorage
  // This effect should only run when `isNarratorsLoaded` or `narrators` (the list) changes.
  // It updates `activeNarrator` if the current one is no longer valid or if it needs to be set.
  useEffect(() => {
    if (isNarratorsLoaded && narrators.length > 0) {
      const currentActiveIdInStorage = localStorage.getItem(ACTIVE_NARRATOR_ID_KEY);
      const foundInLoaded = narrators.find(n => n.id === currentActiveIdInStorage);

      if (foundInLoaded && activeNarrator?.id !== foundInLoaded.id) {
        // If a valid active narrator is found in loaded list, and it's different from current state
        setActiveNarratorState(foundInLoaded);
      } else if (!foundInLoaded && activeNarrator?.id !== narrators[0].id) {
        // If no active narrator was found in localStorage or it's invalid,
        // and the current activeNarrator state is not already the first one
        setActiveNarratorState(narrators[0]);
        localStorage.setItem(ACTIVE_NARRATOR_ID_KEY, narrators[0].id);
      }
    } else if (isNarratorsLoaded && narrators.length === 0 && activeNarrator !== null) {
      // If narrators become empty, clear activeNarrator
      setActiveNarratorState(null);
      localStorage.removeItem(ACTIVE_NARRATOR_ID_KEY);
    }
  }, [isNarratorsLoaded, narrators]); // Removed activeNarrator from dependencies to prevent loop

  const setActiveNarrator = useCallback((narratorId: string) => {
    const selectedNarrator = narrators.find(n => n.id === narratorId);
    if (selectedNarrator) {
      setActiveNarratorState(selectedNarrator);
      localStorage.setItem(ACTIVE_NARRATOR_ID_KEY, narratorId);
    }
  }, [narrators]);

  const addNarrator = useCallback((narratorData: Omit<Narrator, 'id'>) => {
    const newNarrator: Narrator = { ...narratorData, id: `narrator-${Date.now()}` };
    setNarrators(prev => [...prev, newNarrator]);
    toast.success(`Narrador "${newNarrator.name}" creado.`);
  }, [setNarrators]);

  const updateNarrator = useCallback((narratorId: string, narratorData: Omit<Narrator, 'id'>) => {
    setNarrators(prev =>
      prev.map(n => (n.id === narratorId ? { ...n, ...narratorData, id: n.id } : n))
    );
    toast.success(`Narrador "${narratorData.name}" actualizado.`);
  }, [setNarrators]);

  return {
    narrators,
    setNarrators,
    isNarratorsLoaded,
    activeNarrator,
    setActiveNarrator,
    addNarrator,
    updateNarrator,
  };
}