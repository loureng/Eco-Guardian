import React, { useEffect } from 'react';
import { XCircle, X } from 'lucide-react';

interface Props {
  message: string | null;
  onClose: () => void;
}

export const ErrorNotification: React.FC<Props> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-[slideIn_0.3s_ease-out]">
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 backdrop-blur-sm bg-opacity-95">
        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </div>
        <button 
          onClick={onClose} 
          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};