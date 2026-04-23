import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Deposit } from '../types';

const DEPOSITS_STORAGE_KEY = 'deposits-list';

function loadDeposits(): Deposit[] {
  try {
    const raw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Deposit[];
  } catch { /* ignore */ }
  return [];
}

function saveDeposits(deposits: Deposit[]) {
  localStorage.setItem(DEPOSITS_STORAGE_KEY, JSON.stringify(deposits));
}

export function useDeposits() {
  const [deposits, setDepositsState] = useState<Deposit[]>(loadDeposits);

  useEffect(() => {
    saveDeposits(deposits);
  }, [deposits]);

  const setDeposits = useCallback((newDeposits: Deposit[]) => {
    setDepositsState(newDeposits);
  }, []);

  const addDeposit = useCallback((data: Omit<Deposit, 'id'>) => {
    const deposit: Deposit = { ...data, id: uuidv4() };
    setDepositsState(prev => [...prev, deposit]);
  }, []);

  const updateDeposit = useCallback((id: string, data: Partial<Omit<Deposit, 'id'>>) => {
    setDepositsState(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, []);

  const deleteDeposit = useCallback((id: string) => {
    setDepositsState(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDeposit = useCallback((id: string): Deposit | undefined => {
    return deposits.find(d => d.id === id);
  }, [deposits]);

  const activeDeposits = deposits.filter(d => d.status === 'active');

  return { deposits, activeDeposits, addDeposit, updateDeposit, deleteDeposit, getDeposit, setDeposits };
}
