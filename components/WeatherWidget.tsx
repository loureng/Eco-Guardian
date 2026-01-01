
import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Umbrella, ThermometerSun } from 'lucide-react';
import { WeatherData } from '../types';

interface Props {
  weather: WeatherData | null;
  isLoading: boolean;
}

export const WeatherWidget: React.FC<Props> = ({ weather, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-56 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse flex flex-col justify-between">
         <div className="flex justify-between">
           <div className="h-4 w-32 bg-slate-100 rounded"></div>
           <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
         </div>
         <div className="h-16 w-24 bg-slate-100 rounded my-4"></div>
         <div className="grid grid-cols-3 gap-3">
           <div className="h-16 bg-slate-100 rounded-xl"></div>
           <div className="h-16 bg-slate-100 rounded-xl"></div>
           <div className="h-16 bg-slate-100 rounded-xl"></div>
         </div>
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;
  const todayDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });

  // Helpers para ícones e textos
  const getIcon = () => {
    switch (current.condition) {
      case 'Ensolarado': return <Sun className="w-12 h-12 text-amber-500 drop-shadow-sm" />;
      case 'Chuvoso': return <CloudRain className="w-12 h-12 text-blue-500 drop-shadow-sm" />;
      case 'Tempestade': return <Wind className="w-12 h-12 text-slate-600 drop-shadow-sm" />;
      default: return <Cloud className="w-12 h-12 text-slate-400 drop-shadow-sm" />;
    }
  };

  const getUVStatus = (uv: number) => {
    if (uv <= 2) return { text: "Baixo", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (uv <= 5) return { text: "Moderado", color: "text-amber-600", bg: "bg-amber-50" };
    if (uv <= 7) return { text: "Alto", color: "text-orange-600", bg: "bg-orange-50" };
    return { text: "Extremo", color: "text-red-600", bg: "bg-red-50" };
  };

  const uvStatus = getUVStatus(current.uvIndex);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Decorative Background Blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header: Location & Date */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2">
              <MapPin size={14} /> 
              {weather.city}
            </div>
            <p className="text-xs text-slate-400 font-medium capitalize">{todayDate}</p>
          </div>
        </div>

        {/* Main Info: Temp & Condition */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-start">
              <span className="text-6xl font-bold text-slate-800 tracking-tighter">{Math.round(current.temp)}</span>
              <span className="text-2xl font-medium text-slate-400 mt-2">°C</span>
            </div>
            <p className="text-slate-500 font-medium text-lg mt-1 flex items-center gap-2">
              {current.condition}
            </p>
          </div>
          <div className="bg-slate-50/50 p-4 rounded-full border border-slate-100/50 backdrop-blur-sm">
            {getIcon()}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Humidity */}
          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
            <Droplets size={20} className="text-blue-500 mb-1" />
            <span className="text-xl font-bold text-slate-700">{current.humidity}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Umidade</span>
          </div>

          {/* UV Index */}
          <div className={`${uvStatus.bg} border border-transparent p-3 rounded-2xl flex flex-col items-center justify-center gap-1`}>
            <Sun size={20} className={`${uvStatus.color} mb-1`} />
            <div className="flex flex-col items-center leading-none">
              <span className={`text-xl font-bold ${uvStatus.color}`}>{current.uvIndex}</span>
              <span className={`text-[9px] font-bold uppercase ${uvStatus.color} opacity-80 mt-0.5`}>{uvStatus.text}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Índice UV</span>
          </div>

          {/* Rain Chance */}
          <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
            <Umbrella size={20} className="text-indigo-500 mb-1" />
            <span className="text-xl font-bold text-slate-700">{current.rainChance}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chuva</span>
          </div>

        </div>
      </div>
    </div>
  );
};
