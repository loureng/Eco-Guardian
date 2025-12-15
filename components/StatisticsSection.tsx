
import React, { useMemo } from 'react';
import { Plant, WeatherData } from '../types';
import { BarChart3, PieChart } from 'lucide-react';
import { calculateSmartWatering } from '../services/plantLogic';

interface Props {
  plants: Plant[];
  weather: WeatherData | null;
}

export const StatisticsSection: React.FC<Props> = ({ plants, weather }) => {
  
  // 1. Calculate Activity Data (Last 7 Days)
  const activityData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const data = [];
    
    // Create last 7 days array in reverse order
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayKey = days[d.getDay()];
      
      // Count total waterings for this day across all plants
      let count = 0;
      plants.forEach(p => {
        if (p.wateringHistory) {
          p.wateringHistory.forEach(timestamp => {
            const wDate = new Date(timestamp);
            if (wDate.toDateString() === d.toDateString()) {
              count++;
            }
          });
        } else if (p.lastWatered) {
          // Fallback for old data
          const wDate = new Date(p.lastWatered);
          if (wDate.toDateString() === d.toDateString()) {
            count++;
          }
        }
      });
      
      data.push({ day: dayKey, count });
    }
    return data;
  }, [plants]);

  // 2. Calculate Plant Status (On Time vs Late)
  const statusData = useMemo(() => {
    let ok = 0;
    let late = 0;
    
    plants.forEach(p => {
      const schedule = calculateSmartWatering(p, weather);
      if (schedule.daysRemaining < 0) late++;
      else ok++;
    });

    return { ok, late, total: plants.length };
  }, [plants, weather]);

  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  // SVG Calculations for Pie Chart
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const okPercent = statusData.total > 0 ? statusData.ok / statusData.total : 0;
  const okOffset = circumference - (okPercent * circumference);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Activity Chart (Bar) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-600" />
          Atividade Semanal
        </h3>
        
        <div className="h-40 flex items-end justify-between gap-2">
          {activityData.map((d, i) => {
            const heightPercent = (d.count / maxActivity) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                 <div className="w-full relative h-32 flex items-end rounded-t-lg bg-slate-50 overflow-hidden">
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className={`w-full transition-all duration-500 rounded-t-lg ${d.count > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-transparent'}`}
                    >
                       {d.count > 0 && (
                         <div className="w-full text-center text-[10px] text-white font-bold -mt-4 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">
                           {d.count}
                         </div>
                       )}
                    </div>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Chart (Donut) & Stats */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Donut Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
           <div className="relative w-24 h-24 mb-2">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="48" cy="48" r={radius}
                 stroke="#f1f5f9" strokeWidth="8" fill="transparent"
               />
               <circle
                 cx="48" cy="48" r={radius}
                 stroke="#10b981" strokeWidth="8" fill="transparent"
                 strokeDasharray={circumference}
                 strokeDashoffset={okOffset}
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-out"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-xl font-bold text-slate-800">{Math.round(okPercent * 100)}%</span>
               <span className="text-[10px] text-slate-400 uppercase">Saudável</span>
             </div>
           </div>
           <p className="text-xs text-slate-500 text-center">Saúde do Jardim</p>
        </div>

        {/* Text Stats */}
        <div className="space-y-4">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Plantas</p>
             <p className="text-2xl font-bold text-slate-800">{statusData.total}</p>
           </div>
           
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Atrasadas</p>
             <p className={`text-2xl font-bold ${statusData.late > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
               {statusData.late}
             </p>
           </div>
        </div>

      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
