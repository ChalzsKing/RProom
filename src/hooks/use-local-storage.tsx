"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  // Usar una función para la inicialización del estado para que solo se lea de localStorage una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item, (k, v) => {
          if (k === 'timestamp' && typeof v === 'string') {
            return new Date(v);
          }
          return v;
        });
      }
    } catch (error) {
      console.error(`Error cargando de localStorage la clave "${key}":`, error);
    }
    return initialValue;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Establecer isLoaded a true después de la renderización inicial donde se lee localStorage
  useEffect(() => {
    setIsLoaded(true);
  }, []); // Array de dependencias vacío significa que esto se ejecuta una vez después de la renderización inicial

  const setValue: SetValue<T> = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        // Solo actualizar localStorage si el valor ha cambiado realmente para evitar escrituras innecesarias
        const prevString = JSON.stringify(prev);
        const newString = JSON.stringify(valueToStore);
        
        if (prevString !== newString) {
          window.localStorage.setItem(key, newString);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error guardando en localStorage la clave "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, isLoaded];
}