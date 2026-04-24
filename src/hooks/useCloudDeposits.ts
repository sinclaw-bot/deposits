/**
 * Hook that wraps useCloudStorage to persist the deposits array
 * under a single key (`deposits`) via JSON serialization.
 */

import { useCallback } from 'react';
import { useCloudStorage } from './useCloudStorage';
import type { Deposit } from '../types';

const STORAGE_KEY = 'deposits';

export function useCloudDeposits() {
  const { getItem, setItem, removeItem } = useCloudStorage();

  const load = useCallback(async (): Promise<Deposit[]> => {
    const raw = await getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Deposit[];
    } catch {
      return [];
    }
  }, [getItem]);

  const save = useCallback(
    async (deposits: Deposit[]): Promise<void> => {
      await setItem(STORAGE_KEY, JSON.stringify(deposits));
    },
    [setItem],
  );

  const add = useCallback(
    async (deposit: Deposit): Promise<void> => {
      const list = await load();
      list.push(deposit);
      await save(list);
    },
    [load, save],
  );

  const update = useCallback(
    async (id: string, partial: Partial<Omit<Deposit, 'id'>>): Promise<void> => {
      const list = await load();
      const idx = list.findIndex((d) => d.id === id);
      if (idx === -1) return;
      list[idx] = { ...list[idx], ...partial };
      await save(list);
    },
    [load, save],
  );

  const del = useCallback(
    async (id: string): Promise<void> => {
      const list = await load();
      const filtered = list.filter((d) => d.id !== id);
      await save(filtered);
    },
    [load, save],
  );

  const clear = useCallback(async (): Promise<void> => {
    await removeItem(STORAGE_KEY);
  }, [removeItem]);

  return { load, save, add, update, delete: del, clear };
}
