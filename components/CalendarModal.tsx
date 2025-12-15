
import React from 'react';
import { Plant } from '../types';
import { openGoogleCalendar, openOutlookCalendar, downloadIcsFile } from '../services/calendarService';
import { Calendar, X, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  plant: Plant | null;
  nextDate: Date | null;
  onClose: () => void;
}

export const CalendarModal: React.FC<Props> = ({ isOpen, plant, nextDate, onClose }) => {
  if (!isOpen || !plant || !nextDate) return null;

  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(nextDate);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-[scaleIn_0.2s_ease-out] border border-slate-100 overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={20} className="text-emerald-600" />
            <h3 className="font-bold">Agendar Rega</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Adicionar lembrete para <strong>{plant.commonName}</strong> no dia <strong>{formattedDate}</strong>?
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => { openGoogleCalendar(plant, nextDate); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-emerald-200 transition-all group"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-6 h-6" />
              <span className="font-medium text-slate-700 group-hover:text-emerald-700">Google Calendar</span>
            </button>

            <button 
              onClick={() => { openOutlookCalendar(plant, nextDate); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-blue-200 transition-all group"
            >
               <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-6 h-6" />
              <span className="font-medium text-slate-700 group-hover:text-blue-700">Outlook / Office 365</span>
            </button>

            <button 
              onClick={() => { downloadIcsFile(plant, nextDate); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full">
                <Download size={14} className="text-slate-600" />
              </div>
              <span className="font-medium text-slate-700">Apple / Outros (.ics)</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};
