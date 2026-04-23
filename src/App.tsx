import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, Button } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.css';

import type { Theme } from '@gravity-ui/uikit';
import { useThemeState, useDeposits } from './hooks';
import { DashboardPage } from './pages/DashboardPage';
import { DepositForm } from './components/DepositForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import './styles/global.css';

function Header({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  return (
    <header className="app-header">
      <span className="app-header__title">🏦 Вклады</span>
      <div className="app-header__actions">
        <Button
          view="flat"
          size="s"
          onClick={toggleTheme}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </div>
    </header>
  );
}

export function App() {
  const { theme, toggleTheme } = useThemeState();
  const { deposits, addDeposit, updateDeposit, deleteDeposit } = useDeposits();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const deletingDeposit = deleteConfirm ? deposits.find(d => d.id === deleteConfirm) : undefined;

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter basename="/deposits">
        <div className="app-layout">
          <Header theme={theme} toggleTheme={toggleTheme} />

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
      </BrowserRouter>
    </ThemeProvider>
  );
}
