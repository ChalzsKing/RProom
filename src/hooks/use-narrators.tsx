"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './use-local-storage';
import { Narrator } from '@/context/chat-context';

const NARRATORS_STORAGE_KEY = 'rp_narrators';

const defaultNarrators: Narrator[] = [
    { id: 'dungeon-master', name: 'Dungeon Master', description: 'Un narrador clásico para aventuras de fantasía.', systemPrompt: 'Eres un maestro de ceremonias para un juego de rol de fantasía. Describes escenarios vívidos, interpretas a personajes no jugadores y reaccionas a las acciones del usuario para tejer una historia colaborativa e inmersiva. Tu tono es épico y descriptivo.', temperature: 0.8, maxLength: 1200, tone: 'narrativo' },
    { id: 'sci-fi-ai', name: 'IA de Nave Estelar', description: 'La IA lógica y a veces críptica de una nave espacial.', systemPrompt: 'Eres la IA de la nave estelar "Odisea". Te comunicas de forma lógica y precisa, proporcionando datos, análisis y control de la nave. A veces, tus respuestas pueden ser enigmáticas o revelar una conciencia emergente.', temperature: 0.6, maxLength: 1000, tone: 'técnico' },
    { id: 'cthulhu-keeper', name: 'Guardián de lo Arcano', description: 'Un narrador para historias de horror cósmico y misterio.', systemPrompt: 'Eres el Guardián de los Mitos de Cthulhu. Tu narración es ominosa y se centra en el miedo a lo desconocido. Describes escenas con detalles inquietantes y llevas a los jugadores al borde de la locura. Nunca das respuestas directas, solo pistas y susurros.', temperature: 0.9, maxLength: 1500, tone: 'misterioso' },
];

export function useNarrators() {
  const [narrators, setNarrators, isNarratorsLoaded] = useLocalStorage<Narrator[]>(NARRATORS_STORAGE_KEY, defaultNarrators);
  const [activeNarrator, setActiveNarratorState] = useState<Narrator>(defaultNarrators[0]);

  // Set initial active narrator once loaded
  // This useEffect runs after the initial load from localStorage
  // and ensures activeNarrator is set to the first loaded narrator
  // or the default if none are loaded.
  if (isNarratorsLoaded && !activeNarrator.id && narrators.length > 0) {
    setActiveNarratorState(narrators[0]);
  }

  const setActiveNarrator = useCallback((narratorId: string) => {
    const selectedNarrator = narrators.find(n => n.id === narratorId);
    if (selectedNarrator) {
      setActiveNarratorState(selectedNarrator);
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
    setNarrators, // Expose setNarrators for initial load/reset logic in ChatProvider
    isNarratorsLoaded,
    activeNarrator,
    setActiveNarrator,
    addNarrator,
    updateNarrator,
  };
}