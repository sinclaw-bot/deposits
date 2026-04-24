import { Button, Icon } from '@gravity-ui/uikit';
import { Bars } from '@gravity-ui/icons';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="app-header">
      <span className="app-header__title">🏦 Вклады</span>
      <Button view="flat" size="xl" onClick={onMenuClick}>
        <Icon data={Bars} size={18} />
      </Button>
    </header>
  );
}
