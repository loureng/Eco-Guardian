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
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and Escape key
  useEffect(() => {
    if (isOpen) {
      // Focus cancel button for safety (destructive action prevention)
      cancelButtonRef.current?.focus();

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
      onClick={(e) => {
        // Close if clicked specifically on the backdrop
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-[scaleIn_0.2s_ease-out] border border-slate-100">
        <h3 id={titleId} className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p id={descriptionId} className="text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          {/* Ref added to Cancel button to receive initial focus */}
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            className="flex-1"
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
