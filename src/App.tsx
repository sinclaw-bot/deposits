import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.css';
import './styles/gravity-theme.css';

import { useThemeState, useDeposits } from './hooks';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { DashboardPage } from './pages/DashboardPage';
import { DepositForm } from './components/DepositForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useImportExport } from './hooks/useImportExport';

import './styles/global.css';

export function App() {
  const { theme } = useThemeState();
  const [menuOpen, setMenuOpen] = useState(false);
  const { deposits, setDeposits, addDeposit, updateDeposit, deleteDeposit } = useDeposits();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    fileInputRef,
    importConfirm,
    handleExport,
    handleImportClick,
    handleImportFile,
    handleImportConfirm,
    setImportConfirm,
  } = useImportExport(deposits, setDeposits);

  const handleAdd = (data: Parameters<typeof addDeposit>[0]) => addDeposit(data);
  const handleUpdate = (id: string, data: Parameters<typeof updateDeposit>[1]) => updateDeposit(id, data);

  const deletingDeposit = deleteConfirm ? deposits.find(d => d.id === deleteConfirm) : undefined;

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
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                }
              />
              <Route
                path="/add"
                element={<DepositForm deposits={deposits} onSave={handleAdd} onUpdate={handleUpdate} />}
              />
              <Route
                path="/edit/:id"
                element={<DepositForm deposits={deposits} onSave={handleAdd} onUpdate={handleUpdate} />}
              />
            </Routes>
          </main>

          <SideMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onExport={handleExport}
            onImportClick={handleImportClick}
          />
        </div>

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Удалить вклад?"
          text={
            deletingDeposit
              ? `Вы уверены, что хотите удалить вклад «${deletingDeposit.name}»? Это действие нельзя отменить.`
              : 'Вы уверены?'
          }
          onConfirm={() => {
            if (deleteConfirm) {
              deleteDeposit(deleteConfirm);
              setDeleteConfirm(null);
            }
          }}
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
