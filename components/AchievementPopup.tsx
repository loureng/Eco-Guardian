
import React, { useEffect } from 'react';
import { Achievement } from '../types';
import { Trophy, Sprout, Trees, Flower2, Droplets, X } from 'lucide-react';

interface Props {
  achievement: Achievement | null;
  onClose: () => void;
}

// Helper to map string icon names to components
const getIcon = (name: string, size: number = 24) => {
  switch (name) {
    case 'Sprout': return <Sprout size={size} />;
    case 'Trees': return <Trees size={size} />;
    case 'Flower2': return <Flower2 size={size} />;
    case 'Droplets': return <Droplets size={size} />;
    default: return <Trophy size={size} />;
  }
};

export const AchievementPopup: React.FC<Props> = ({ achievement, onClose }) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none pb-24 px-4">
      <div className="bg-white border-2 border-yellow-400 rounded-2xl p-4 shadow-2xl w-full max-w-sm pointer-events-auto animate-[slideUp_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden">
        {/* Background shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-50 via-white to-yellow-50 opacity-50 z-0"></div>
        
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 z-10">
          <X size={16} />
        </button>

        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-14 h-14 rounded-full ${achievement.color} flex items-center justify-center text-white shadow-md shrink-0`}>
             {getIcon(achievement.icon, 28)}
          </div>
          <div>
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-0.5">Nova Conquista!</p>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{achievement.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{achievement.description}</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
