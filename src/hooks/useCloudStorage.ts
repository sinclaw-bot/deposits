/**
 * Async CRUD over Telegram.WebApp.CloudStorage.
 * Falls back to localStorage when running outside Telegram.
 */

import { useCallback } from 'react';
import { tg } from '../lib/telegram';

type CloudStorageError = string | null;
type CloudStorageGetItem = (key: string, callback: (error: CloudStorageError, result?: string) => unknown) => void;
type CloudStorageSetItem = (key: string, value: string, callback: (error: CloudStorageError, result?: boolean) => unknown) => void;
type CloudStorageRemoveItem = (key: string, callback: (error: CloudStorageError, result?: boolean) => unknown) => void;

const cloudStorage = (tg && 'CloudStorage' in tg ? (tg.CloudStorage as {
  getItem: CloudStorageGetItem;
  setItem: CloudStorageSetItem;
  removeItem: CloudStorageRemoveItem;
}) : null);

function getItemFallback(key: string): Promise<string | null> {
  try {
    return Promise.resolve(localStorage.getItem(key));
  } catch {
    return Promise.resolve(null);
  }
}

function setItemFallback(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

function removeItemFallback(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

export function useCloudStorage() {
  const getItem = useCallback(
    (key: string): Promise<string | null> => {
      if (!cloudStorage) {
        return getItemFallback(key);
      }
      return new Promise((resolve) => {
        cloudStorage.getItem(key, (err: CloudStorageError, value?: string) => {
          resolve(err ? null : (value ?? null));
        });
      });
    },
    [],
  );

  const setItem = useCallback(
    (key: string, value: string): Promise<void> => {
      if (!cloudStorage) {
        return setItemFallback(key, value);
      }
      return new Promise((resolve) => {
        cloudStorage.setItem(key, value, (err: CloudStorageError) => {
          if (err) {
            setItemFallback(key, value);
          }
          resolve();
        });
      });
    },
    [],
  );

  const removeItem = useCallback(
    (key: string): Promise<void> => {
      if (!cloudStorage) {
        return removeItemFallback(key);
      }
      return new Promise((resolve) => {
        cloudStorage.removeItem(key, (err: CloudStorageError) => {
          if (err) {
            removeItemFallback(key);
          }
          resolve();
        });
      });
    },
    [],
  );

  return { getItem, setItem, removeItem };
}
