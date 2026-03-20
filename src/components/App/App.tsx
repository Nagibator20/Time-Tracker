import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { Tabs } from '../Tabs';
import { TabContent } from '../TabContent';
import { DeleteConfirmModal } from '../DeleteConfirmModal/DeleteConfirmModal';
import { useTabs } from '../../hooks/useTabs';
import { useAppStore } from '../../store';
import './App.scss';

const MonthlyReport = lazy(() => import('../MonthlyReport/MonthlyReport').then(m => ({ default: m.MonthlyReport })));

const LoadingFallback: React.FC = () => (
  <div className="loading-fallback" role="status" aria-live="polite">
    <div className="loading-spinner"></div>
    <span className="sr-only">Загрузка...</span>
  </div>
);

export const App: React.FC = () => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    renameTab,
    deleteTab
  } = useTabs();
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [showReport, setShowReport] = useState(false);
  const [lastActiveTabId, setLastActiveTabId] = useState<string | null>(null);
  const [tabToDelete, setTabToDelete] = useState<{ id: string, name: string } | null>(null);

  const handleTabSelect = useCallback((id: string) => {
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
  }, [activeTabId, showReport, lastActiveTabId, setActiveTabId]);

  const handleCreateTab = useCallback(() => {
    createTab();
    setShowReport(false);
  }, [createTab]);

  const handleTabRename = useCallback((id: string, name: string) => {
    renameTab(id, name);
  }, [renameTab]);

  const handleTabDeleteRequest = useCallback((id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      setTabToDelete({ id: tab.id, name: tab.name });
    }
  }, [tabs]);

  const confirmDelete = useCallback(() => {
    if (tabToDelete) {
      deleteTab(tabToDelete.id);
      setTabToDelete(null);
    }
  }, [tabToDelete, deleteTab]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="app">
      <main className="app__content">
        {showReport ? (
          <Suspense fallback={<LoadingFallback />}>
            <MonthlyReport />
          </Suspense>
        ) : activeTab ? (
          <TabContent tab={activeTab} />
        ) : (
          <div className="app__empty">
            <p>Создайте вкладку для начала работы</p>
            <button
              className="app__create-button"
              onClick={() => handleCreateTab()}
              autoFocus
            >
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
