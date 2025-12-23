import { WeatherData, UserLocation, DailyForecast } from "../types";
import { MOCK_WEATHER_SCENARIOS } from "../constants";

// Safely access env var
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_OPENWEATHER_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_OPENWEATHER_API_KEY;
  }
  return undefined;
};

const API_KEY = getApiKey();

// OpenWeatherMap API Types
interface OWMCurrent {
  dt: number;
  temp: number;
  humidity: number;
  uvi: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
}

interface OWMDaily {
  dt: number;
  temp: {
    min: number;
    max: number;
    // other parts not needed yet
  };
  pop: number; // Probability of precipitation (0-1)
  uvi: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
}

interface OWMResponse {
  lat: number;
  lon: number;
  current: OWMCurrent;
  daily: OWMDaily[];
}

const mapWeatherCondition = (id: number): 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Tempestade' => {
  if (id >= 200 && id < 300) return 'Tempestade';
  if (id >= 300 && id < 600) return 'Chuvoso'; // Drizzle and Rain
  if (id >= 600 && id < 700) return 'Chuvoso'; // Snow
  if (id >= 700 && id < 800) return 'Nublado'; // Atmosphere
  if (id === 800) return 'Ensolarado';
  if (id > 800) return 'Nublado'; // Clouds
  return 'Nublado'; // Default fallback
};

// Fallback to mock data
const getMockWeather = (location: UserLocation): WeatherData => {
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
            condition: base.condition as "Ensolarado" | "Nublado" | "Chuvoso" | "Tempestade"
        });
        }
        return forecast;
    };

    const randomScenario = MOCK_WEATHER_SCENARIOS[Math.floor(Math.random() * MOCK_WEATHER_SCENARIOS.length)];

    return {
        current: {
            ...randomScenario,
            condition: randomScenario.condition as "Ensolarado" | "Nublado" | "Chuvoso" | "Tempestade"
        },
        forecast: getNextDays(5),
        city: location.city || "Localização Desconhecida",
    };
}

export const fetchLocalWeather = async (location: UserLocation): Promise<WeatherData> => {
  if (!API_KEY) {
    console.warn("VITE_OPENWEATHER_API_KEY is not defined. Using mock data.");
    return getMockWeather(location);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&exclude=minutely,hourly,alerts&units=metric&lang=pt_br&appid=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error(`Weather API Error: ${response.statusText}`);
    }

    const data: OWMResponse = await response.json();

    const currentCondition = mapWeatherCondition(data.current.weather[0].id);

    // Map next 5 days
    // OWM daily[0] is today. daily[1] is tomorrow.

    const forecast: DailyForecast[] = data.daily.slice(1, 6).map((day) => {
        const date = new Date(day.dt * 1000);
        return {
            date: date.toISOString().split('T')[0],
            tempMax: Math.round(day.temp.max),
            tempMin: Math.round(day.temp.min),
            rainChance: Math.round(day.pop * 100),
            uvIndex: Math.round(day.uvi),
            condition: mapWeatherCondition(day.weather[0].id)
        };
    });

    return {
        current: {
            temp: Math.round(data.current.temp),
            condition: currentCondition,
            uvIndex: Math.round(data.current.uvi),
            rainChance: Math.round(data.daily[0].pop * 100), // Chance of rain today
            humidity: data.current.humidity
        },
        forecast: forecast,
        city: location.city || "Localização Desconhecida",
    };

  } catch (error: unknown) {
    console.error("Failed to fetch weather data:", error);
    return getMockWeather(location);
  }
};
