import { useRef, useState, useCallback } from 'react';
import type { Deposit } from '../types';

export function useImportExport(deposits: Deposit[], onReplace: (data: Deposit[]) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirm, setImportConfirm] = useState<Deposit[] | null>(null);

  const handleExport = useCallback(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const blob = new Blob([JSON.stringify(deposits, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deposits-export-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [deposits]);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data) || !data.every((item: Record<string, unknown>) => typeof item.amount === 'number')) {
          alert('Ошибка: неверный формат файла. Ожидается массив объектов с полем amount.');
          return;
        }
        setImportConfirm(data as Deposit[]);
      } catch {
        alert('Ошибка: не удалось прочитать файл.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleImportConfirm = useCallback(() => {
    if (importConfirm) {
      onReplace(importConfirm);
      setImportConfirm(null);
    }
  }, [importConfirm, onReplace]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    importConfirm,
    handleExport,
    handleImportClick,
    handleImportFile,
    handleImportConfirm,
    setImportConfirm,
  };
}
