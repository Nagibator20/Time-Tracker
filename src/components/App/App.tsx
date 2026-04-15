import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { Tabs } from '../Tabs';
import { TabContent } from '../TabContent';
import { DeleteConfirmModal } from '../DeleteConfirmModal/DeleteConfirmModal';
import { ToastProvider, useToast } from '../Toast';
import { useTabs } from '../../hooks/useTabs';
import { useAppStore } from '../../store';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import './App.scss';

const MonthlyReport = lazy(() =>
  import('../MonthlyReport/MonthlyReport').then(m => ({ default: m.MonthlyReport }))
);

const LoadingFallback: React.FC = () => (
  <div className="loading-fallback" role="status" aria-live="polite">
    <div className="loading-spinner"></div>
    <span className="sr-only">Загрузка...</span>
  </div>
);

const AppContent: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, createTab, renameTab, deleteTab, restoreDeletedTab } =
    useTabs();
  const theme = useAppStore(state => state.theme);
  const hasHydrated = useAppStore(state => state._hasHydrated);
  const { showToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [showReport, setShowReport] = useState(false);
  const [lastActiveTabId, setLastActiveTabId] = useState<string | null>(null);
  const [tabToDelete, setTabToDelete] = useState<{ id: string; name: string } | null>(null);

  useKeyboardShortcuts({
    onNewTab: () => {
      createTab();
      setShowReport(false);
    },
    onToggleTheme: () => {
      useAppStore.getState().toggleTheme();
    },
    onEscape: () => {
      setTabToDelete(null);
      setShowReport(false);
    },
  });

  const handleTabSelect = useCallback(
    (id: string) => {
      if (id === 'report') {
        if (showReport && lastActiveTabId) {
          setActiveTabId(lastActiveTabId);
          setShowReport(false);
        } else {
          if (activeTabId) setLastActiveTabId(activeTabId);
          setShowReport(true);
          setActiveTabId(null);
        }
      } else {
        setActiveTabId(id);
        setLastActiveTabId(id);
        setShowReport(false);
      }
    },
    [activeTabId, showReport, lastActiveTabId, setActiveTabId]
  );

  const handleCreateTab = useCallback(() => {
    createTab();
    setShowReport(false);
  }, [createTab]);

  const handleTabRename = useCallback(
    (id: string, name: string) => {
      renameTab(id, name);
    },
    [renameTab]
  );

  const handleTabDeleteRequest = useCallback(
    (id: string) => {
      const tab = tabs.find(t => t.id === id);
      if (tab) {
        setTabToDelete({ id: tab.id, name: tab.name });
      }
    },
    [tabs]
  );

  const confirmDelete = useCallback(() => {
    if (tabToDelete) {
      deleteTab(tabToDelete.id);
      setTabToDelete(null);
      showToast(
        `${tabToDelete.name}`,
        'undo',
        {
          label: 'Восстановить',
          onClick: () => {
            restoreDeletedTab();
            showToast('Вкладка восстановлена', 'success');
          },
        },
        5000
      );
    }
  }, [tabToDelete, deleteTab, restoreDeletedTab, showToast]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!hasHydrated) {
    return (
      <div className="app">
        <main className="app__content">
          <LoadingFallback />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app__content">
        {showReport ? (
          <Suspense fallback={<LoadingFallback />}>
            <MonthlyReport />
          </Suspense>
        ) : activeTab ? (
          <TabContent tab={activeTab} showToast={showToast} />
        ) : (
          <div className="app__empty">
            <p>Создайте вкладку для начала работы</p>
            <button className="app__create-button" onClick={() => handleCreateTab()} autoFocus>
              Создать вкладку
            </button>
          </div>
        )}
      </main>
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabCreate={handleCreateTab}
        onTabRename={handleTabRename}
        onTabDelete={handleTabDeleteRequest}
        showReport={showReport}
      />

      <DeleteConfirmModal
        isOpen={!!tabToDelete}
        tabName={tabToDelete?.name || ''}
        onClose={() => setTabToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};
