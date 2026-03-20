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

  return (
    <div className="tabs" ref={containerRef}>
      <div className="tabs__container">
        {groupedTabs.map(group => {
          const isExpanded = expandedYear === group.year;
          const hasActiveTab = group.tabs.some(t => t.id === activeTabId);

          return (
            <div key={group.year} className="tabs__group">
              <div
                className={`tabs__group-header ${isExpanded ? 'tabs__group-header--expanded' : ''} ${hasActiveTab ? 'tabs__group-header--active' : ''}`}
                onClick={(e) => toggleYear(e, group.year)}
              >
                <span className="tabs__group-title">{group.year}</span>
                <span className="tabs__group-count">{group.tabs.length}</span>
                <span className="tabs__group-arrow">{isExpanded ? '▾' : '▴'}</span>
              </div>
              {isExpanded && (
                <div className="tabs__group-items">
                  {group.tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`tabs__item ${activeTabId === tab.id ? 'tabs__item--active' : ''}`}
                      onClick={() => handleTabClick(tab.id)}
                      onDoubleClick={(e) => handleDoubleClick(e, tab)}
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
                        />
                      ) : (
                        <span className="tabs__name">{tab.name}</span>
                      )}
                      <button
                        className="tabs__delete-button"
                        onClick={(e) => handleDelete(e, tab.id)}
                      >
                        ×
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
        >
          +
        </button>
        <div className="tabs__separator"></div>
        <div
          className={`tabs__item tabs__item--report ${showReport ? 'tabs__item--active' : ''}`}
          onClick={() => onTabSelect('report')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Отчёт
        </div>
      </div>
    </div>
  );
};

export const Tabs = memo(TabsComponent);
