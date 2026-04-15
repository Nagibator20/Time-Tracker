import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { Tab } from '../../types';
import './Tabs.scss';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (id: string) => void;
  onTabCreate: () => void;
  onTabRename: (id: string, name: string) => void;
  onTabDelete: (id: string) => void;
  showReport?: boolean;
}

interface TabGroup {
  year: number;
  tabs: Tab[];
}

const TabsComponent: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabCreate,
  onTabRename,
  onTabDelete,
  showReport = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedYear(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const groupedTabs = useMemo(() => {
    const groups: TabGroup[] = [];
    const tabMap = new Map<number, Tab[]>();

    tabs.forEach(tab => {
      const yearTabs = tabMap.get(tab.year) || [];
      yearTabs.push(tab);
      tabMap.set(tab.year, yearTabs);
    });

    const sortedYears = Array.from(tabMap.keys()).sort((a, b) => a - b);
    sortedYears.forEach(year => {
      groups.push({ year, tabs: tabMap.get(year)! });
    });

    return groups;
  }, [tabs]);

  const toggleYear = useCallback((e: React.MouseEvent, year: number) => {
    e.stopPropagation();
    setExpandedYear(prev => prev === year ? null : year);
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    setEditingId(tab.id);
    setEditingName(tab.name);
  }, []);

  const handleRenameSubmit = useCallback(() => {
    if (editingId && editingName.trim()) {
      onTabRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, onTabRename]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingName('');
    }
  }, [handleRenameSubmit]);

  const handleDelete = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabDelete(tabId);
  }, [onTabDelete]);

  const handleCreateTab = useCallback(() => {
    onTabCreate();
  }, [onTabCreate]);

  const handleTabClick = useCallback((id: string) => {
    onTabSelect(id);
  }, [onTabSelect]);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabSelect(id);
    }
  }, [onTabSelect]);

  const handleGroupKeyDown = useCallback((e: React.KeyboardEvent, year: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpandedYear(prev => prev === year ? null : year);
    }
  }, []);

  return (
    <nav className="tabs" ref={containerRef} aria-label="Навигация по месяцам">
      <div className="tabs__container">
        {groupedTabs.map(group => {
          const isExpanded = expandedYear === group.year;
          const hasActiveTab = group.tabs.some(t => t.id === activeTabId);

          return (
            <div key={group.year} className="tabs__group">
              <div
                className={`tabs__group-header ${isExpanded ? 'tabs__group-header--expanded' : ''} ${hasActiveTab ? 'tabs__group-header--active' : ''}`}
                onClick={(e) => toggleYear(e, group.year)}
                onKeyDown={(e) => handleGroupKeyDown(e, group.year)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`tabs-year-${group.year}`}
              >
                <span className="tabs__group-title">{group.year}</span>
                <span className="tabs__group-count" aria-label={`${group.tabs.length} месяцев`}>{group.tabs.length}</span>
                <span className="tabs__group-arrow" aria-hidden="true">{isExpanded ? '▾' : '▴'}</span>
              </div>
              {isExpanded && (
                <div 
                  className="tabs__group-items" 
                  id={`tabs-year-${group.year}`}
                  role="tablist"
                  aria-label={`Месяцы ${group.year} года`}
                >
                  {group.tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`tabs__item ${activeTabId === tab.id ? 'tabs__item--active' : ''}`}
                      onClick={() => handleTabClick(tab.id)}
                      onDoubleClick={(e) => handleDoubleClick(e, tab)}
                      onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                      role="tab"
                      tabIndex={0}
                      aria-selected={activeTabId === tab.id}
                      aria-label={`${tab.name}${activeTabId === tab.id ? ' (активная вкладка)' : ''}`}
                    >
                      {editingId === tab.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          className="tabs__name-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={handleRenameKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Новое название вкладки"
                        />
                      ) : (
                        <span className="tabs__name">{tab.name}</span>
                      )}
                      <button
                        className="tabs__delete-button"
                        onClick={(e) => handleDelete(e, tab.id)}
                        aria-label={`Удалить ${tab.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <button
          className="tabs__add-button"
          onClick={handleCreateTab}
          title="Создать вкладку"
          aria-label="Создать новую вкладку"
        >
          <span>+</span>
        </button>
        <div className="tabs__separator"></div>
        <div
          className={`tabs__item tabs__item--report ${showReport ? 'tabs__item--active' : ''}`}
          onClick={() => onTabSelect('report')}
          onKeyDown={(e) => handleTabKeyDown(e, 'report')}
          role="tab"
          tabIndex={0}
          aria-selected={showReport}
          aria-label="Годовой отчёт"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Отчёт
        </div>
      </div>
    </nav>
  );
};

export const Tabs = memo(TabsComponent);
