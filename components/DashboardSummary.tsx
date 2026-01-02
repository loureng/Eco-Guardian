
import React, { useMemo, memo } from 'react';
import { Plant, WeatherData } from '../types';
import { calculateSmartWatering, checkPlantHealth } from '../services/plantLogic';
import { Droplets, CheckCircle2, AlertTriangle, CloudRain } from 'lucide-react';

interface Props {
  plants: Plant[];
  weather: WeatherData | null;
}

const DashboardSummaryComponent: React.FC<Props> = ({ plants, weather }) => {
  // Memoize statistics calculation to prevent expensive re-loops on every render
  const stats = useMemo(() => {
    if (plants.length === 0) return { tasksToday: 0, healthyPlants: 0, alertsCount: 0 };

    let tasksToday = 0;
    let healthyPlants = 0;
    let alertsCount = 0;

    plants.forEach(plant => {
      // Check Tasks
      const schedule = calculateSmartWatering(plant, weather);
      if (schedule.daysRemaining <= 0) tasksToday++;

      // Check Health
      const alerts = checkPlantHealth(plant, weather);
      if (alerts.some(a => a.type === 'danger' || a.type === 'warning')) {
        alertsCount++;
      } else {
        healthyPlants++;
      }
    });

    return { tasksToday, healthyPlants, alertsCount };
  }, [plants, weather]);

  const nextRain = useMemo(() => {
    return weather?.forecast.find(f => f.rainChance > 60);
  }, [weather]);

  if (plants.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Card 1: Tarefas Hoje */}
      <div className={`p-4 rounded-2xl border flex flex-col justify-between ${stats.tasksToday > 0 ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <div className={`p-2 rounded-lg ${stats.tasksToday > 0 ? 'bg-white/20' : 'bg-slate-100 text-emerald-600'}`}>
            <Droplets size={20} />
          </div>
          {stats.tasksToday > 0 && <span className="text-xs font-bold bg-white text-emerald-600 px-2 py-0.5 rounded-full">Ação</span>}
        </div>
        <div>
          <span className="text-3xl font-bold">{stats.tasksToday}</span>
          <p className={`text-xs font-medium ${stats.tasksToday > 0 ? 'text-emerald-100' : 'text-slate-400'}`}>
            Plantas para regar hoje
          </p>
        </div>
      </div>

      {/* Card 2: Saúde Geral */}
      <div className="p-4 rounded-2xl border border-slate-100 bg-white flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle2 size={20} />
          </div>
          {stats.alertsCount > 0 && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
               <AlertTriangle size={10} /> {stats.alertsCount} Alertas
             </span>
          )}
        </div>
        <div>
          <span className="text-3xl font-bold text-slate-800">{Math.round((stats.healthyPlants / plants.length) * 100)}%</span>
          <p className="text-xs font-medium text-slate-400">Jardim Saudável</p>
        </div>
      </div>

      {/* Card 3: Previsão Rápida */}
      <div className="col-span-2 p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <CloudRain size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-indigo-400">Previsão de Chuva</p>
              <p className="text-sm font-bold text-slate-700">
                {nextRain 
                  ? `Chuva esperada para ${new Date(nextRain.date).toLocaleDateString('pt-BR', { weekday: 'long' })}` 
                  : "Sem chuva forte nos próximos 5 dias"}
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export const DashboardSummary = memo(DashboardSummaryComponent);
