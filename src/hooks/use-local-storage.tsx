"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Special handling for Date objects if needed, otherwise direct parse
        const parsed = JSON.parse(item, (k, v) => {
          if (k === 'timestamp' && typeof v === 'string') {
            return new Date(v);
          }
          return v;
        });
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    } finally {
      setIsLoaded(true);
    }
  }, [key, initialValue]);

  const setValue: SetValue<T> = useCallback((value) => {
    try {
      // Use functional update to get the latest state without needing it in useCallback's deps
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key]); // Only `key` is needed here, as `setStoredValue` is stable.

  return [storedValue, setValue, isLoaded];
}