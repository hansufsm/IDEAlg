"use client";

import { useState, useEffect } from 'react';

/**
 * Um hook React para persistir o estado no localStorage, com tipagem.
 *
 * @param key A chave sob a qual o valor será armazenado no localStorage.
 * @param initialValue O valor inicial a ser usado se nada for encontrado no localStorage.
 * @returns Um array contendo o valor armazenado e uma função para atualizá-lo.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}