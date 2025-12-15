
import React, { useMemo } from 'react';
import { Plant, WeatherData } from '../types';
import { calculateSmartWatering } from '../services/plantLogic';
import { Calendar, Droplets, ArrowRight, CalendarPlus, Clock } from 'lucide-react';

interface Props {
  plants: Plant[];
  weather: WeatherData | null;
  onWater: (id: string) => void;
  onSchedule: (plant: Plant, date: Date) => void;
}

export const AgendaView: React.FC<Props> = ({ plants, weather, onWater, onSchedule }) => {
  
  const scheduleData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const items = plants.map(plant => {
      const info = calculateSmartWatering(plant, weather);
      return { plant, info };
    });

    // Sort by date
    items.sort((a, b) => a.info.nextDate.getTime() - b.info.nextDate.getTime());

    // Grouping
    const groups = {
      today: items.filter(i => i.info.daysRemaining <= 0),
      week: items.filter(i => i.info.daysRemaining > 0 && i.info.daysRemaining <= 7),
      later: items.filter(i => i.info.daysRemaining > 7)
    };

    return groups;
  }, [plants, weather]);

  if (plants.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Agenda Vazia</h3>
        <p className="text-slate-500">Adicione plantas para ver o cronograma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Agenda do Jardim</h2>
        <p className="text-slate-500 text-sm">Próximas regas e cuidados baseados no clima.</p>
      </div>

      {/* TODAY */}
      <div>
        <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hoje / Atrasado
        </h3>
        
        {scheduleData.today.length === 0 ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> Tudo em dia por hoje!
          </div>
        ) : (
          <div className="space-y-3">
            {scheduleData.today.map(({ plant, info }) => (
              <div key={plant.id} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <img src={plant.imageUrl} alt={plant.commonName} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                   <div>
                     <h4 className="font-bold text-slate-800">{plant.commonName}</h4>
                     <p className="text-xs text-red-500 font-bold">Ação Necessária</p>
                   </div>
                </div>
                <button 
                  onClick={() => onWater(plant.id)}
                  className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
                >
                  <Droplets size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THIS WEEK */}
      {scheduleData.week.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
            <Clock size={14} /> Próximos 7 Dias
          </h3>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
            {scheduleData.week.map(({ plant, info }, idx) => (
              <div key={plant.id} className="ml-6 relative">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-300"></div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                   <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center bg-slate-50 p-2 rounded-lg min-w-[50px]">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {info.nextDate.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className="text-xl font-bold text-slate-800">
                          {info.nextDate.getDate()}
                        </span>
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800">{plant.commonName}</h4>
                         <p className="text-xs text-slate-500 flex items-center gap-1">
                           {info.adjusted && <span className="text-blue-500 font-bold">Ajustado por IA: </span>}
                           {info.reason}
                         </p>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => onSchedule(plant, info.nextDate)}
                     className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors w-full sm:w-auto"
                   >
                     <CalendarPlus size={14} /> Integrar Calendário
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LATER */}
      {scheduleData.later.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-3">Futuro (+7 dias)</h3>
          <div className="grid grid-cols-1 gap-2">
            {scheduleData.later.map(({ plant, info }) => (
              <div key={plant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-slate-500">
                 <span className="font-medium">{plant.commonName}</span>
                 <span className="text-xs bg-white px-2 py-1 rounded border border-slate-100">
                   {info.nextDate.toLocaleDateString('pt-BR')}
                 </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
import { CheckCircle2 } from 'lucide-react';
