
import { SunTolerance } from './types';

export const APP_NAME = "EcoGuardian";

// Mock Weather Data em Português
export const MOCK_WEATHER_SCENARIOS = [
  { 
    temp: 28, 
    condition: 'Ensolarado', 
    uvIndex: 9, 
    rainChance: 5, 
    humidity: 45 
  },
  { 
    temp: 18, 
    condition: 'Chuvoso', 
    uvIndex: 2, 
    rainChance: 90, 
    humidity: 85 
  },
  { 
    temp: 22, 
    condition: 'Nublado', 
    uvIndex: 4, 
    rainChance: 20, 
    humidity: 60 
  },
];

export const PLANT_IDENTIFICATION_PROMPT = `
Identifique esta planta e forneça um guia completo de cuidados.
Forneça a resposta estritamente em formato JSON.
Eu preciso de:
- scientificName (string)
- commonName (string, nome popular em Português do Brasil)
- category (string, ex: "Suculenta", "Samambaia", "Tropical", "Erva")
- description (string, max 150 caracteres, curiosidade ou resumo interessante sobre a planta)
- origin (string, ex: "África do Sul", "América Tropical")
- careTips (array de strings, 3 dicas curtas e valiosas de cuidado específico)
- wateringFrequencyDays (number, estimativa conservadora em dias)
- sunTolerance (string: "Sombra", "Meia-sombra" ou "Sol Pleno")
- minTemp (number, celsius)
- maxTemp (number, celsius)
- fertilizer (string, max 100 caracteres. Qual tipo de adubo, NPK ideal ou nutrientes necessários?)
- soil (string, max 100 caracteres. Tipo de substrato, drenagem, terra vegetal, areia?)
- environmentTips (string, max 120 caracteres. Precisa de vento? Gosta de chuva? Ar condicionado faz mal? Interior ou Exterior?)
`;

export const PLANT_DETAILS_PROMPT = `
Forneça os dados técnicos completos de cuidado para a planta: "{{NAME}}".
Se o nome for vago, escolha a espécie mais comum associada a ele.
Forneça a resposta estritamente em formato JSON.
Eu preciso de:
- scientificName (string)
- commonName (string, nome popular em Português do Brasil)
- category (string, ex: "Suculenta", "Samambaia", "Tropical", "Erva")
- description (string, max 150 caracteres, curiosidade ou resumo interessante sobre a planta)
- origin (string, ex: "África do Sul", "América Tropical")
- careTips (array de strings, 3 dicas curtas e valiosas de cuidado específico)
- wateringFrequencyDays (number, estimativa conservadora em dias)
- sunTolerance (string: "Sombra", "Meia-sombra" ou "Sol Pleno")
- minTemp (number, celsius)
- maxTemp (number, celsius)
- fertilizer (string, max 100 caracteres. Qual tipo de adubo, NPK ideal ou nutrientes necessários?)
- soil (string, max 100 caracteres. Tipo de substrato, drenagem, terra vegetal, areia?)
- environmentTips (string, max 120 caracteres. Precisa de vento? Gosta de chuva? Ar condicionado faz mal? Interior ou Exterior?)
`;

export const DEFAULT_PLANT_IMAGE = "https://picsum.photos/400/400";
