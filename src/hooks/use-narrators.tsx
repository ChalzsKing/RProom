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
  
  const [activeNarrator, setActiveNarratorState] = useState<Narrator | null>(null);

  // Effect to initialize activeNarrator from localStorage or set a default
  useEffect(() => {
    if (isNarratorsLoaded && narrators.length > 0) {
      const activeId = localStorage.getItem(ACTIVE_NARRATOR_ID_KEY);
      const found = narrators.find(n => n.id === activeId);
      const currentActive = found || narrators[0];
      
      // Only update state if it's actually different to prevent loops
      if (activeNarrator?.id !== currentActive.id) {
        setActiveNarratorState(currentActive);
        // If the found narrator was invalid, update localStorage with the default
        if (!found) {
          localStorage.setItem(ACTIVE_NARRATOR_ID_KEY, currentActive.id);
        }
      }
    } else if (isNarratorsLoaded && narrators.length === 0) {
      // Handle case where there are no narrators
      if (activeNarrator !== null) {
        setActiveNarratorState(null);
        localStorage.removeItem(ACTIVE_NARRATOR_ID_KEY);
      }
    }
  }, [isNarratorsLoaded, narrators, activeNarrator]);

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