
import { Plant, WeatherData, Alert, SunTolerance } from '../types';

interface WateringSchedule {
  nextDate: Date;
  daysRemaining: number;
  reason: string;
  adjusted: boolean;
}

/**
 * Calcula a próxima data de rega utilizando todas as variáveis meteorológicas disponíveis.
 * O 'Fator de Secagem' (Drying Factor) determina se o solo seca mais rápido (positivo) ou devagar (negativo).
 */
export const calculateSmartWatering = (plant: Plant, weather: WeatherData | null): WateringSchedule => {
  const lastWatered = plant.lastWatered || Date.now();
  const baseFrequency = plant.wateringFrequencyDays;
  
  if (!weather) {
    const target = new Date(lastWatered);
    target.setDate(target.getDate() + baseFrequency);
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { nextDate: target, daysRemaining: diff, reason: "Cronograma padrão", adjusted: false };
  }

  // Fator acumulativo: Quanto maior, mais rápido a água evapora
  let dryingFactor = 0;
  let reasons: string[] = [];

  const current = weather.current;

  // 1. Temperatura (Peso Alto)
  if (current.temp > 30) {
    dryingFactor += 1.5;
    reasons.push("Calor intenso");
  } else if (current.temp > 25) {
    dryingFactor += 0.5;
  } else if (current.temp < 15) {
    dryingFactor -= 1.0;
    reasons.push("Frio (metabolismo lento)");
  }

  // 2. Umidade do Ar (Peso Médio)
  if (current.humidity < 35) {
    dryingFactor += 1.0;
    reasons.push("Ar muito seco");
  } else if (current.humidity > 80) {
    dryingFactor -= 0.5;
  }

  // 3. Índice UV (Peso Médio - Evaporação superficial)
  // UV Alto seca a camada superficial do solo rapidamente
  if (current.uvIndex >= 8) {
    dryingFactor += 0.5;
    if (!reasons.includes("Sol forte")) reasons.push("UV Alto");
  }

  // 4. Vento (Considerado via condição)
  if (current.condition === 'Tempestade' || current.condition === 'Nublado') {
     // Vento aumenta evaporação, mas nublado diminui.
     // Se for tempestade (vento forte), seca mais rápido se não chover.
  }

  // 5. Previsão Futura (Próximos 3 dias)
  const nearForecast = weather.forecast.slice(0, 3);
  let rainProbabilitySum = 0;

  nearForecast.forEach(day => {
    rainProbabilitySum += day.rainChance;
    if (day.tempMax > 32) dryingFactor += 0.2; // Onda de calor vindo
  });

  // Se a chance média de chuva for alta, adiar rega drasticamente
  if (rainProbabilitySum / 3 > 60) {
    dryingFactor -= 3.0; 
    reasons = ["Chuva prevista nos próximos dias"]; // Sobrescreve outros motivos pois é dominante
  } else if (current.rainChance > 70) {
    dryingFactor -= 2.0;
    reasons = ["Chuva hoje"];
  }

  // Cálculo Final
  let adjustedDays = Math.round(baseFrequency - dryingFactor);
  
  // Limites de Segurança (Safe Bounds)
  // Mínimo 1 dia (não regar 2x no mesmo dia), Máximo 2x a frequência base (para não morrer de sede)
  adjustedDays = Math.max(1, Math.min(adjustedDays, baseFrequency * 2));

  const nextDate = new Date(lastWatered);
  nextDate.setDate(nextDate.getDate() + adjustedDays);
  
  const diffTime = nextDate.getTime() - Date.now();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Formatar motivo principal
  let finalReason = "Cronograma padrão";
  const isAdjusted = Math.abs(baseFrequency - adjustedDays) >= 1;

  if (isAdjusted && reasons.length > 0) {
    // Pega o motivo mais impactante ou combina os dois primeiros
    finalReason = reasons.slice(0, 2).join(" + ");
    if (dryingFactor > 0) finalReason = "Adiantado: " + finalReason;
    else finalReason = "Adiado: " + finalReason;
  }

  return {
    nextDate,
    daysRemaining,
    reason: finalReason,
    adjusted: isAdjusted
  };
};

/**
 * Gera a Revisão Diária da planta.
 * Analisa se a planta precisa ser movida, protegida ou nebulizada hoje.
 */
export const checkPlantHealth = (plant: Plant, weather: WeatherData | null): Alert[] => {
  const alerts: Alert[] = [];
  if (!weather) return alerts;

  const current = weather.current;
  const tomorrow = weather.forecast[0];

  const category = plant.category ? plant.category.toLowerCase() : '';
  const isSucculent = category.includes('suculenta') || category.includes('cacto');
  const isTropical = category.includes('tropical') ||
                     category.includes('samambaia') ||
                     category.includes('folhagem');

  // --- 1. Gestão de Água e Chuva ---
  if (current.rainChance > 80 && isSucculent) {
    alerts.push({
      type: 'danger',
      message: 'Proteja da chuva agora! Risco de apodrecimento.',
      plantId: plant.id
    });
  }

  // --- 2. Gestão de Umidade (Nebulização) ---
  // Plantas tropicais sofrem em ar seco, mesmo com solo úmido
  if (isTropical && current.humidity < 40) {
    alerts.push({
      type: 'info',
      message: 'Ar muito seco: Borrife água nas folhas hoje.',
      plantId: plant.id
    });
  }

  // --- 3. Gestão de Sol e UV ---
  // Plantas de sombra queimam rápido com UV alto
  if (plant.sunTolerance === SunTolerance.SHADE) {
    if (current.uvIndex >= 8) {
      alerts.push({
        type: 'danger',
        message: 'UV Crítico: Garanta sombra total agora.',
        plantId: plant.id
      });
    } else if (current.uvIndex >= 6) {
      alerts.push({
        type: 'warning',
        message: 'Sol forte: Evite raios diretos.',
        plantId: plant.id
      });
    }
  }

  // --- 4. Gestão de Temperatura ---
  if (current.temp < plant.minTemp) {
    alerts.push({
      type: 'danger',
      message: `Frio excessivo (${current.temp}°C). Leve para dentro.`,
      plantId: plant.id
    });
  } else if (tomorrow && tomorrow.tempMin < plant.minTemp) {
    alerts.push({
      type: 'warning',
      message: `Alerta de frio amanhã. Prepare proteção.`,
      plantId: plant.id
    });
  }

  // --- 5. Dica Positiva (Otimização) ---
  // Se estiver tudo perfeito, dar feedback positivo em alguns casos
  if (isTropical && current.humidity > 70 && current.temp > 22 && current.temp < 28) {
     alerts.push({
       type: 'success',
       message: 'Clima perfeito para crescimento hoje!',
       plantId: plant.id
     });
  }

  return alerts;
};

export const getAggregateAlerts = (plants: Plant[], weather: WeatherData | null): Alert[] => {
  return plants.flatMap(plant => checkPlantHealth(plant, weather));
};
