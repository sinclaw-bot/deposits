import { Button } from '@gravity-ui/uikit';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, text, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-dialog__title">{title}</div>
        <div className="confirm-dialog__text">{text}</div>
        <div className="confirm-dialog__actions">
          <Button view="outlined" onClick={onCancel}>Отмена</Button>
          <Button view="outlined-danger" onClick={onConfirm}>Удалить</Button>
        </div>
      </div>
    </div>
  );
}
