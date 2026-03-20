import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onSave?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
  onNewTab?: () => void;
  onExport?: () => void;
  onToggleTheme?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
      (e.target as HTMLElement).tagName
    );
    const isContentEditable = (e.target as HTMLElement).isContentEditable;

    const handleShortcut = (key: string, handler?: () => void, ctrlRequired = true) => {
      if (ctrlRequired && !e.ctrlKey && !e.metaKey) return;
      if (isInputField && !e.ctrlKey && !e.metaKey) return;
      if (isContentEditable) return;
      
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler?.();
      }
    };

    handleShortcut('s', shortcuts.onSave);
    handleShortcut('c', shortcuts.onCopy, false);
    handleShortcut('v', shortcuts.onPaste, false);
    handleShortcut('a', shortcuts.onSelectAll, false);
    handleShortcut('n', shortcuts.onNewTab);
    handleShortcut('e', shortcuts.onExport);
    handleShortcut('t', shortcuts.onToggleTheme, false);

    if (e.key === 'Escape' && !isInputField) {
      shortcuts.onEscape?.();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
