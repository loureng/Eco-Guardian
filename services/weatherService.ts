
import { WeatherData, UserLocation, DailyForecast } from "../types";
import { MOCK_WEATHER_SCENARIOS } from "../constants";

// Helper to generate next days
const getNextDays = (days: number): DailyForecast[] => {
  const forecast: DailyForecast[] = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    
    // Randomize slightly based on base scenarios
    const base = MOCK_WEATHER_SCENARIOS[Math.floor(Math.random() * MOCK_WEATHER_SCENARIOS.length)];
    
    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      tempMax: base.temp + Math.floor(Math.random() * 5),
      tempMin: base.temp - Math.floor(Math.random() * 5),
      rainChance: base.rainChance,
      uvIndex: base.uvIndex,
      condition: base.condition as any
    });
  }
  return forecast;
};

// In a real app, this would call OpenWeatherMap One Call API
export const fetchLocalWeather = async (location: UserLocation): Promise<WeatherData> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Randomly select a current scenario
  const randomScenario = MOCK_WEATHER_SCENARIOS[Math.floor(Math.random() * MOCK_WEATHER_SCENARIOS.length)];
  
  return {
    current: {
      ...randomScenario,
      condition: randomScenario.condition as any
    },
    forecast: getNextDays(5),
    city: location.city || "Localização Desconhecida",
  };
};
