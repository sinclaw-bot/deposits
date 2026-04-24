/**
 * Theme selector component.
 * Shows 3 options: light, dark, Telegram.
 * Telegram option is hidden when running outside Telegram.
 */

import { Button, Icon } from '@gravity-ui/uikit';
import { Sun, Moon, FaceRobot } from '@gravity-ui/icons';
import { isTelegram } from '../lib/telegram';

export type ThemeOption = 'light' | 'dark' | 'telegram';

interface ThemeSelectorProps {
  value: ThemeOption;
  onChange: (theme: ThemeOption) => void;
}

const OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun; requiresTelegram?: boolean }[] = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
  { value: 'telegram', label: 'Telegram', icon: FaceRobot, requiresTelegram: true },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Тема</h3>
      {OPTIONS.filter((opt) => !opt.requiresTelegram || isTelegram).map((opt) => (
        <Button
          key={opt.value}
          view={value === opt.value ? 'action' : 'normal'}
          size="xl"
          onClick={() => onChange(opt.value)}
          style={{ justifyContent: 'flex-start' }}
        >
          <Icon data={opt.icon} size={16} /> {opt.label}
        </Button>
      ))}
    </div>
  );
}
