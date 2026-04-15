import React, { memo } from 'react';
import { Modal } from '../Modal';
import './DeleteConfirmModal.scss';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tabName: string;
}

const DeleteConfirmModalComponent: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tabName
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Удаление месяца"
      titleId="delete-modal-title"
      showCloseButton={false}
      className="delete-modal"
    >
      <div className="delete-modal__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </div>
      <p className="delete-modal__text" id="delete-modal-description">
        Вы уверены, что хотите удалить <strong>{tabName}</strong>?
      </p>
      <p className="delete-modal__hint">
        Все записи о времени и расчетах для этого месяца будут безвозвратно удалены.
      </p>
      <div className="delete-modal__actions">
        <button 
          className="delete-modal__btn delete-modal__btn--cancel" 
          onClick={onClose}
        >
          Отмена
        </button>
        <button 
          className="delete-modal__btn delete-modal__btn--confirm" 
          onClick={onConfirm}
        >
          Удалить
        </button>
      </div>
    </Modal>
  );
};

export const DeleteConfirmModal = memo(DeleteConfirmModalComponent);
