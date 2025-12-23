import { ChevronDown, BookOpen, Globe, Sparkles, BarChart3 } from 'lucide-react';

import React, { useMemo, useState } from 'react';
import { Plant, WeatherData } from '../types';
import { 
  Droplets, Thermometer, Sun, AlertTriangle, Trash2, CalendarClock, 
  TrendingUp, TrendingDown, CheckCircle2, Info, CalendarPlus,
  Wind, Sprout, Layers
} from 'lucide-react';
import { checkPlantHealth, calculateSmartWatering } from '../services/plantLogic';
import { DATE_FORMATTER } from '../services/formatters';

interface Props {
  plant: Plant;
  weather: WeatherData | null;
  onWater: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (plant: Plant, date: Date) => void;
}

const PlantCardComponent: React.FC<Props> = ({ plant, weather, onWater, onDelete, onSchedule }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Real-time Logic Calculation (Daily Review)
  // ⚡ Bolt Optimization: Memoize alerts to prevent recalculation on internal state changes (like expanding the card)
  const activeAlerts = useMemo(() => checkPlantHealth(plant, weather), [plant, weather]);
  
  // Calculate Smart Schedule based on full meteorology
  const schedule = useMemo(() => calculateSmartWatering(plant, weather), [plant, weather]);

  const isUrgent = schedule.daysRemaining <= 0;
  const isToday = schedule.daysRemaining === 0;

  // Visual History Data Calculation
  const historyChartData = useMemo(() => {
    const history = plant.wateringHistory ? [...plant.wateringHistory].sort((a, b) => a - b) : [];
    const recentHistory = history.slice(-5); // Last 5 entries
    
    // Normalize data for chart
    const dataPoints: { date: Date; days: number; type: 'past' | 'future' }[] = [];
    
    // Process Past
    recentHistory.forEach((timestamp, idx) => {
      let interval = plant.wateringFrequencyDays; // Default for first point
      if (idx > 0) {
        const prev = recentHistory[idx - 1];
        interval = Math.round((timestamp - prev) / (1000 * 60 * 60 * 24));
      }
      dataPoints.push({ date: new Date(timestamp), days: interval, type: 'past' });
    });

    // Add Future Prediction
    const now = new Date().getTime();
    const lastWatered = recentHistory.length > 0 ? recentHistory[recentHistory.length - 1] : now;
    // Calculate days from last watered to scheduled date
    const daysToNext = Math.max(1, Math.ceil((schedule.nextDate.getTime() - lastWatered) / (1000 * 60 * 60 * 24)));
    
    dataPoints.push({ 
      date: schedule.nextDate, 
      days: daysToNext, 
      type: 'future' 
    });

    return dataPoints;
  }, [plant.wateringHistory, plant.wateringFrequencyDays, schedule.nextDate]);

  // Determine max value for chart scaling
  const maxChartValue = Math.max(
    ...historyChartData.map(d => d.days), 
    plant.wateringFrequencyDays * 1.5,
    10 
  );

  const getAlertStyle = (type: string) => {
    switch(type) {
      case 'danger': return 'bg-red-50 text-red-700 border-red-100';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'danger': return <AlertTriangle size={14} />;
      case 'success': return <CheckCircle2 size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
      {/* Header Image Area - Clickable */}
      <div className="relative h-40 bg-slate-100 group/image">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 z-0"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Recolher detalhes de ${plant.commonName}` : `Expandir detalhes de ${plant.commonName}`}
        >
          <img
            src={plant.imageUrl || "https://picsum.photos/400/300"}
            alt={plant.commonName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />
        </button>
        
        {/* Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plant.id);
          }}
          className="absolute top-2 left-2 w-8 h-8 bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white shadow-sm backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
          title="Excluir planta"
          aria-label={`Excluir ${plant.commonName}`}
        >
          <Trash2 size={14} />
        </button>

        {/* Badge de Próxima Ação */}
        <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 backdrop-blur-md z-0 pointer-events-none
          ${isUrgent ? 'bg-white/90 text-emerald-700' : 'bg-slate-900/70 text-white'}`}>
          <CalendarClock size={12} />
          {isToday ? 'Regar Hoje' : schedule.daysRemaining < 0 ? 'Atrasada' : `${schedule.daysRemaining} dias`}
        </div>
      </div>
      
      <div className="p-4">
        {/* Title Row - Clickable */}
        <button
          type="button"
          className="w-full flex justify-between items-start mb-1 cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
        >
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{plant.commonName}</h3>
            <p className="text-xs text-slate-500 italic">{plant.scientificName}</p>
          </div>
          <div className={`text-slate-400 p-1 hover:bg-slate-50 rounded-full transition-all duration-300 ${isExpanded ? 'rotate-180 bg-slate-50' : ''}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {/* Daily Review Section (Alerts) */}
        {activeAlerts.length > 0 ? (
          <div className="mb-3 mt-3 space-y-1.5">
            <p className="text-[10px] font-bold uppercase text-slate-400 ml-1">Revisão Diária</p>
            {activeAlerts.map((alert, idx) => (
              <div key={idx} className={`text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 border ${getAlertStyle(alert.type)}`}>
                {getAlertIcon(alert.type)}
                {alert.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3 mt-3">
             <div className="text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-100">
                <CheckCircle2 size={14} className="text-emerald-500"/>
                Tudo certo por hoje.
             </div>
          </div>
        )}

        {/* DETAILS SECTION (EXPANDABLE) */}
        {isExpanded && (
           <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs animate-[fadeIn_0.3s_ease-out] overflow-hidden">
              
              {/* Basic Technical Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-100">
                 <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] flex items-center gap-1">
                      <Sun size={12} /> Sol
                    </span>
                    <span className="font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                      {plant.sunTolerance}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] flex items-center gap-1">
                      <Thermometer size={12} /> Temp Ideal
                    </span>
                    <span className="font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                      {plant.minTemp}°C - {plant.maxTemp}°C
                    </span>
                 </div>
              </div>

              {/* Advanced Care Info (Nutrients, Soil, Wind) */}
              {(plant.fertilizer || plant.soil || plant.environmentTips) && (
                <div className="mb-4 space-y-3 pb-3 border-b border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                     <BookOpen size={12} /> Ficha Técnica Avançada
                  </h4>
                  
                  {/* Fertilizer */}
                  {plant.fertilizer && (
                     <div className="flex gap-2 items-start">
                        <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 shrink-0 mt-0.5">
                           <Sprout size={12} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Adubação & Nutrientes</p>
                           <p className="text-slate-700 leading-snug">{plant.fertilizer}</p>
                        </div>
                     </div>
                  )}

                  {/* Soil */}
                  {plant.soil && (
                     <div className="flex gap-2 items-start">
                        <div className="bg-amber-100 p-1.5 rounded-full text-amber-700 shrink-0 mt-0.5">
                           <Layers size={12} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Solo Ideal</p>
                           <p className="text-slate-700 leading-snug">{plant.soil}</p>
                        </div>
                     </div>
                  )}

                  {/* Environment/Wind */}
                  {plant.environmentTips && (
                     <div className="flex gap-2 items-start">
                        <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0 mt-0.5">
                           <Wind size={12} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Ambiente & Ventilação</p>
                           <p className="text-slate-700 leading-snug">{plant.environmentTips}</p>
                        </div>
                     </div>
                  )}
                </div>
              )}

              {/* General Description & Origin */}
              {(plant.description || plant.origin || (plant.careTips && plant.careTips.length > 0)) && (
                <div className="mb-4 space-y-3 pb-3 border-b border-slate-100">
                  {plant.description && (
                    <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-50">
                      <p className="text-slate-600 italic leading-relaxed">"{plant.description}"</p>
                    </div>
                  )}

                  {plant.origin && (
                     <div className="flex items-center gap-2 text-slate-500 justify-end text-[10px]">
                        <Globe size={10} className="text-slate-400" />
                        <span>Origem: {plant.origin}</span>
                     </div>
                  )}

                  {plant.careTips && plant.careTips.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-[10px] font-bold uppercase text-emerald-600 mb-1.5 flex items-center gap-1">
                        <Sparkles size={10} /> Dicas Extras
                      </h4>
                      <ul className="space-y-1">
                        {plant.careTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-600">
                             <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0"></div>
                             <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Visual History Chart */}
              <div>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1"><BarChart3 size={12} /> Histórico de Regas</span>
                  <span className="text-[9px] font-normal text-slate-300">Dias entre regas</span>
                </h4>
                
                <div className="flex items-end gap-2 h-20 w-full pb-1 pt-4 px-1 bg-white rounded-lg border border-slate-100 shadow-inner">
                    {historyChartData.length === 0 ? (
                       <p className="text-slate-400 italic text-[10px] w-full text-center self-center">Sem histórico suficiente.</p>
                    ) : (
                       historyChartData.map((item, i) => {
                         const heightPercent = Math.max(15, Math.min(100, (item.days / maxChartValue) * 100));
                         const isFuture = item.type === 'future';
                         
                         return (
                           <div
                             key={i}
                             className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:rounded-sm"
                             tabIndex={0}
                             role="img"
                             aria-label={`${isFuture ? 'Previsão' : 'Histórico'}: ${item.days} dias em ${item.date.getDate()}/${item.date.getMonth()+1}`}
                           >
                              {/* Floating Tooltip */}
                              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg z-20 whitespace-nowrap pointer-events-none">
                                {item.days} dias
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                              </div>
                              
                              <div 
                                style={{ height: `${heightPercent}%` }} 
                                className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 relative ${
                                  isFuture 
                                  ? 'bg-emerald-50 border border-dashed border-emerald-400' 
                                  : 'bg-blue-400 hover:bg-blue-500'
                                }`}
                              >
                                {isFuture && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                     <div className="w-0.5 h-full bg-emerald-400/30"></div>
                                  </div>
                                )}
                              </div>
                              
                              <span className={`text-[8px] font-bold uppercase tracking-tighter ${isFuture ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.date.getDate()}/{item.date.getMonth()+1}
                              </span>
                           </div>
                         );
                       })
                    )}
                </div>
              </div>
           </div>
        )}

        {/* Smart Schedule Detail */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100 mt-2">
           <div className="flex flex-col">
             <span className="font-medium text-slate-700">Próxima Rega</span>
             <span className="flex items-center gap-1">
               {DATE_FORMATTER.format(schedule.nextDate)}
               
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   onSchedule(plant, schedule.nextDate);
                 }}
                 className="ml-1 p-2 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors"
                 title="Adicionar ao Calendário"
                 aria-label="Adicionar rega ao calendário"
               >
                 <CalendarPlus size={14} />
               </button>
             </span>
           </div>
           
           {schedule.adjusted && (
             <div className="text-right flex flex-col items-end">
               <span className={`font-medium flex items-center gap-1 ${schedule.reason.includes('Adiantado') ? 'text-amber-600' : 'text-blue-600'}`}>
                 {schedule.reason.includes('Adiantado') ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                 Ajuste IA
               </span>
               <span className="text-[10px] max-w-[120px] truncate">{schedule.reason}</span>
             </div>
           )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onWater(plant.id);
          }}
          className={`w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
            ${isUrgent 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Droplets size={16} />
          {isUrgent ? 'Regar Agora' : 'Marcar Rega (Adiantar)'}
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; max-height: 0; transform: translateY(-10px); } to { opacity: 1; max-height: 1000px; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export const PlantCard = React.memo(PlantCardComponent);
