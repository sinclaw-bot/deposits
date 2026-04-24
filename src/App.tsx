import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, Button, Icon, Drawer } from '@gravity-ui/uikit';
import { FileArrowUp, FileArrowDown, Sun, Moon, Bars } from '@gravity-ui/icons';
import '@gravity-ui/uikit/styles/styles.css';
import './styles/gravity-theme.css';
import './styles/tg-theme.css';

import { useThemeState, useDeposits } from './hooks';
import { DashboardPage } from './pages/DashboardPage';
import { DepositForm } from './components/DepositForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ThemeSelector } from './components/ThemeSelector';
import { isTelegram } from './lib/telegram';
import type { Deposit } from './types';
import './styles/global.css';

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="app-header">
      <span className="app-header__title">🏦 Вклады</span>
      <Button view="flat" size="l" onClick={onMenuClick}>
        <Icon data={Bars} size={18} />
      </Button>
    </header>
  );
}

export function App() {
  const { theme, themeOption, setTheme, toggleTheme } = useThemeState();
  const [menuOpen, setMenuOpen] = useState(false);
  const { deposits, setDeposits, addDeposit, updateDeposit, deleteDeposit } = useDeposits();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importConfirm, setImportConfirm] = useState<Deposit[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add tg-theme class to root element when in Telegram
  useEffect(() => {
    const root = document.querySelector('.g-root');
    if (root && isTelegram) {
      root.classList.add('tg-theme');
    }
    // No cleanup needed — component stays mounted
  }, []);

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
          <Header onMenuClick={() => setMenuOpen(true)} />

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

          <Drawer open={menuOpen} onOpenChange={(o) => setMenuOpen(o)} placement="right">
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Меню</h3>
              <Button view="normal" size="l" onClick={handleExport} style={{ justifyContent: 'flex-start' }}>
                <Icon data={FileArrowUp} size={16} /> Экспорт данных
              </Button>
              <Button view="normal" size="l" onClick={handleImportClick} style={{ justifyContent: 'flex-start' }}>
                <Icon data={FileArrowDown} size={16} /> Импорт данных
              </Button>
              <Button view="flat" size="l" onClick={toggleTheme} style={{ justifyContent: 'flex-start' }}>
                <Icon data={theme === 'light' ? Moon : Sun} size={16} /> {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              </Button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--g-color-line-generic)', margin: '8px 0' }} />

              <ThemeSelector value={themeOption} onChange={setTheme} />
            </div>
          </Drawer>
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
