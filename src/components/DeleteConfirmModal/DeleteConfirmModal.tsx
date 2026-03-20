import React from 'react';
import './DeleteConfirmModal.scss';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tabName: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tabName
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Удаление месяца</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__content">
          <div className="delete-modal__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <p className="delete-modal__text">
            Вы уверены, что хотите удалить <strong>{tabName}</strong>?
          </p>
          <p className="delete-modal__hint">
            Все записи о времени и расчетах для этого месяца будут безвозвратно удалены.
          </p>
          <div className="delete-modal__actions">
            <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onClose}>
              Отмена
            </button>
            <button className="delete-modal__btn delete-modal__btn--confirm" onClick={onConfirm}>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
