import { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, Button } from '@gravity-ui/uikit';
import { FileArrowUp, FileArrowDown, Sun, Moon } from '@gravity-ui/icons';
import '@gravity-ui/uikit/styles/styles.css';
import './styles/gravity-theme.css';

import type { Theme } from '@gravity-ui/uikit';
import { useThemeState, useDeposits } from './hooks';
import { DashboardPage } from './pages/DashboardPage';
import { DepositForm } from './components/DepositForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import type { Deposit } from './types';
import './styles/global.css';

function Header({
  theme,
  toggleTheme,
  onExport,
  onImport,
}: {
  theme: Theme;
  toggleTheme: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  return (
    <header className="app-header">
      <span className="app-header__title">Вклады</span>
      <div className="app-header__actions">
        <Button view="flat" size="s" onClick={onExport}>
          <FileArrowUp /> Экспорт
        </Button>
        <Button view="flat" size="s" onClick={onImport}>
          <FileArrowDown /> Импорт
        </Button>
        <Button
          view="flat"
          size="s"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </Button>
      </div>
    </header>
  );
}

export function App() {
  const { theme, toggleTheme } = useThemeState();
  const { deposits, setDeposits, addDeposit, updateDeposit, deleteDeposit } = useDeposits();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importConfirm, setImportConfirm] = useState<Deposit[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (data: Parameters<typeof addDeposit>[0]) => {
    addDeposit(data);
  };

  const handleUpdate = (id: string, data: Parameters<typeof updateDeposit>[1]) => {
    updateDeposit(id, data);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteDeposit(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleExport = () => {
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
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = () => {
    if (importConfirm) {
      setDeposits(importConfirm);
      setImportConfirm(null);
    }
  };

  const deletingDeposit = deleteConfirm ? deposits.find(d => d.id === deleteConfirm) : undefined;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter basename="/deposits">
        <div className="app-layout">
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            onExport={handleExport}
            onImport={handleImportClick}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />

          <main className="app-content">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    deposits={deposits}
                    onEdit={() => {}}
                    onDelete={handleDeleteRequest}
                  />
                }
              />
              <Route
                path="/add"
                element={
                  <DepositForm
                    deposits={deposits}
                    onSave={handleAdd}
                    onUpdate={handleUpdate}
                  />
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <DepositForm
                    deposits={deposits}
                    onSave={handleAdd}
                    onUpdate={handleUpdate}
                  />
                }
              />
            </Routes>
          </main>
        </div>

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Удалить вклад?"
          text={
            deletingDeposit
              ? `Вы уверены, что хотите удалить вклад «${deletingDeposit.name}»? Это действие нельзя отменить.`
              : 'Вы уверены?'
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />

        <ConfirmDialog
          open={!!importConfirm}
          title="Импортировать вклады?"
          text={`Вы уверены, что хотите заменить все текущие вклады (${deposits.length} шт.) на импортированные (${importConfirm?.length ?? 0} шт.)? Это действие нельзя отменить.`}
          onConfirm={handleImportConfirm}
          onCancel={() => setImportConfirm(null)}
          confirmText="Импортировать"
          confirmView="action"
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}
