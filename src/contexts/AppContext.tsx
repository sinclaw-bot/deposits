import { createContext, useContext } from 'react';
import type { Deposit } from '../types';

interface AppContextType {
  hideAmounts: boolean;
  toggleHideAmounts: () => void;
}

export const AppContext = createContext<AppContextType>({
  hideAmounts: false,
  toggleHideAmounts: () => {},
});

export function useApp() {
  return useContext(AppContext);
}
