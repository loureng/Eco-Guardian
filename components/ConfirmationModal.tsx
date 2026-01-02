import React, { useEffect, useRef, useId } from 'react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const titleId = useId();
  const messageId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape key handling
  useEffect(() => {
    if (isOpen) {
      // Focus cancel button on open for safety
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={messageId}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-[scaleIn_0.2s_ease-out] border border-slate-100">
        <h3 id={titleId} className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p id={messageId} className="text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            ref={cancelButtonRef}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">Excluir</Button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};
