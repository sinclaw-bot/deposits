import { Button, Drawer, Icon } from '@gravity-ui/uikit';
import { FileArrowUp, FileArrowDown } from '@gravity-ui/icons';

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  onImportClick: () => void;
}

export function SideMenu({ open, onOpenChange, onExport, onImportClick }: SideMenuProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} placement="right">
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Меню</h3>
        <Button view="normal" size="xl" onClick={onExport} style={{ justifyContent: 'flex-start' }}>
          <Icon data={FileArrowUp} size={16} /> Экспорт данных
        </Button>
        <Button view="normal" size="xl" onClick={onImportClick} style={{ justifyContent: 'flex-start' }}>
          <Icon data={FileArrowDown} size={16} /> Импорт данных
        </Button>
      </div>
    </Drawer>
  );
}
