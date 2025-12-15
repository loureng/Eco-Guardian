
export enum SunTolerance {
  SHADE = "Sombra",
  PARTIAL = "Meia-sombra",
  FULL_SUN = "Sol Pleno"
}

export type DwellingType = 'Casa' | 'Apartamento';

export interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  category?: string; 
  description?: string; 
  origin?: string; 
  careTips?: string[]; 
  
  // Novos campos detalhados
  fertilizer?: string; // Dicas de adubação/nutrientes
  soil?: string; // Tipo de solo ideal
  environmentTips?: string; // Ventilação, chuva, ar livre vs interior

  wateringFrequencyDays: number;
  sunTolerance: SunTolerance;
  minTemp: number;
  maxTemp: number;
  lastWatered?: number; 
  wateringHistory?: number[]; 
  imageUrl?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; 
  color: string; 
}

export interface UserProfile {
  id: string;
  name: string;
  dwellingType?: DwellingType; // Novo campo
  location: UserLocation | null;
  plants: Plant[];
  unlockedAchievements: string[]; 
}

export interface DailyForecast {
  date: string; 
  tempMax: number;
  tempMin: number;
  rainChance: number; 
  uvIndex: number;
  condition: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Tempestade';
}

export interface WeatherData {
  current: {
    temp: number;
    condition: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Tempestade';
    uvIndex: number;
    rainChance: number; 
    humidity: number; 
  };
  forecast: DailyForecast[];
  city: string;
}

export interface Alert {
  type: 'warning' | 'info' | 'danger' | 'success'; 
  message: string;
  plantId?: string;
}
