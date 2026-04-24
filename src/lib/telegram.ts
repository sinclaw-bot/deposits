/**
 * Telegram Mini App (TMA) initialization.
 * Works both inside Telegram and in a regular browser.
 */

import WebAppSDK from '@twa-dev/sdk';

type TelegramWebApp = typeof WebAppSDK;

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

if (tg) {
  tg.ready();
}

export const user = tg?.initDataUnsafe?.user;
export const isTelegram = !!tg;
export { tg };
