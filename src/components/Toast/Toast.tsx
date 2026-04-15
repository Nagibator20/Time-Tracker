import React, { createContext, useContext, useState, useCallback, memo, useRef, useEffect } from 'react';
import './Toast.scss';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning' | 'undo';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'error' | 'success' | 'warning' | 'undo', action?: Toast['action'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

const UndoToast: React.FC<{
  toast: Toast;
  onRemove: (id: number) => void;
}> = memo(({ toast, onRemove }) => {
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const duration = toast.duration || 5000;
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    elapsedRef.current = Date.now() - startTimeRef.current;
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const duration = toast.duration || 5000;
    const remaining = duration - elapsedRef.current;
    if (remaining > 0) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onRemove(toast.id);
      }, remaining);
    }
    setIsPaused(false);
  }, [toast.duration, toast.id, onRemove]);

  return (
    <div
      className="toast toast--undo"
      role="alert"
      aria-atomic="true"
      style={{ '--toast-duration': `${toast.duration || 5000}ms` } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="toast__message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={(e) => {
            e.stopPropagation();
            toast.action!.onClick();
            onRemove(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <div className="toast__progress">
        <div className={`toast__progress-bar ${isPaused ? 'toast__progress-bar--paused' : ''}`} />
      </div>
    </div>
  );
});

UndoToast.displayName = 'UndoToast';

const ToastProviderComponent: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'warning' | 'undo' = 'error', action?: Toast['action'], duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action, duration }]);
    if (type !== 'undo') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-label="Уведомления">
        {toasts.filter(t => t.type !== 'undo').map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast--${toast.type}`}
            role="alert"
            aria-atomic="true"
          >
            <span className="toast__icon" aria-hidden="true">
              {toast.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              {toast.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              )}
            </span>
            <span className="toast__message">{toast.message}</span>
            {toast.action && (
              <button 
                className="toast__action"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.action!.onClick();
                  removeToast(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button 
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Закрыть уведомление"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="toast-container--undo" aria-live="polite" aria-label="Отмена удаления">
        {toasts.filter(t => t.type === 'undo').map((toast) => (
          <UndoToast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const ToastProvider = memo(ToastProviderComponent);
