import { Button } from '@gravity-ui/uikit';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmView?: 'outlined-danger' | 'action' | 'outlined';
}

export function ConfirmDialog({
  open,
  title,
  text,
  onConfirm,
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmView = 'outlined-danger',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-dialog__title">{title}</div>
        <div className="confirm-dialog__text">{text}</div>
        <div className="confirm-dialog__actions">
          <Button view="outlined" onClick={onCancel}>{cancelText}</Button>
          <Button view={confirmView} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
