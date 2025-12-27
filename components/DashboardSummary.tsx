
import React, { useMemo } from 'react';
import { Plant, WeatherData } from '../types';
import { calculateSmartWatering, checkPlantHealth, analyzeWeatherFactors } from '../services/plantLogic';
import { Droplets, CheckCircle2, AlertTriangle, CloudRain } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { WeatherFactors } from '../services/plantLogic';

interface Props {
  plants: Plant[];
  weather: WeatherData | null;
  weatherFactors?: WeatherFactors;
}

export const DashboardSummary = React.memo<Props>(({ plants, weather, weatherFactors: propWeatherFactors }) => {
  // Memoize calculations to prevent re-calculation on every render
  const summary = useMemo(() => {
    if (plants.length === 0) return null;

    let tasks = 0;
    let healthy = 0;
    let alerts = 0;

    // ⚡ Bolt Optimization: Pre-calculate weather factors once instead of for every plant
    // Use passed factors if available, otherwise calculate locally
    const weatherFactors = propWeatherFactors || (weather ? analyzeWeatherFactors(weather) : undefined);

    plants.forEach(plant => {
      // Check Tasks
      // Pass the pre-calculated weather factors to avoid redundant weather analysis loops
      const schedule = calculateSmartWatering(plant, weather, weatherFactors);
      if (schedule.daysRemaining <= 0) tasks++;

      // Check Health
      const plantAlerts = checkPlantHealth(plant, weather);
      if (plantAlerts.some(a => a.type === 'danger' || a.type === 'warning')) {
        alerts++;
      } else {
        healthy++;
      }
    });

    return { tasksToday: tasks, healthyPlants: healthy, alertsCount: alerts };
  }, [plants, weather, propWeatherFactors]);

  const nextRain = useMemo(() => weather?.forecast.find(f => f.rainChance > 60), [weather]);

  if (plants.length === 0 || !summary) return null;

  const { tasksToday, healthyPlants, alertsCount } = summary;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Card 1: Tarefas Hoje */}
      <div className={`p-4 rounded-2xl border flex flex-col justify-between ${tasksToday > 0 ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <div className={`p-2 rounded-lg ${tasksToday > 0 ? 'bg-white/20' : 'bg-slate-100 text-emerald-600'}`}>
            <Droplets size={20} />
          </div>
          {tasksToday > 0 && <span className="text-xs font-bold bg-white text-emerald-600 px-2 py-0.5 rounded-full">Ação</span>}
        </div>
        <div>
          <span className="text-3xl font-bold">{tasksToday}</span>
          <p className={`text-xs font-medium ${tasksToday > 0 ? 'text-emerald-100' : 'text-slate-400'}`}>
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
          {alertsCount > 0 && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
               <AlertTriangle size={10} /> {alertsCount} Alertas
             </span>
          )}
        </div>
        <div>
          <span className="text-3xl font-bold text-slate-800">{Math.round((healthyPlants / plants.length) * 100)}%</span>
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
});
