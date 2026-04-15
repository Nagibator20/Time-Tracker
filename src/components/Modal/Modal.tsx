import React, { useEffect, useCallback, memo } from 'react';
import ReactDOM from 'react-dom';
import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  className = '',
  showCloseButton = true
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId || 'modal-title'}
    >
      <div 
        className={`modal ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title" id={titleId || 'modal-title'}>{title}</h3>
          {showCloseButton && (
            <button 
              className="modal__close" 
              onClick={onClose}
              aria-label="Закрыть"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export const Modal = memo(ModalComponent);
