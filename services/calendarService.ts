
import { Plant } from "../types";

/**
 * Formata data para string YYYYMMDDTHHmmssZ (UTC) exigida por calendários
 */
const formatDateForCalendar = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
};

const getEventDetails = (plant: Plant, nextWaterDate: Date) => {
  // Define horário padrão para 08:00 da manhã do dia da rega
  const startDate = new Date(nextWaterDate);
  startDate.setHours(8, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(8, 30, 0, 0); // Duração de 30 min

  const title = `Regar: ${plant.commonName}`;
  const description = `Lembrete do EcoGuardian para regar sua ${plant.commonName} (${plant.scientificName}). Verifique a umidade do solo antes.`;

  return { startDate, endDate, title, description };
};

export const openGoogleCalendar = (plant: Plant, nextWaterDate: Date) => {
  const { startDate, endDate, title, description } = getEventDetails(plant, nextWaterDate);
  
  const startStr = formatDateForCalendar(startDate);
  const endStr = formatDateForCalendar(endDate);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", title);
  url.searchParams.append("dates", `${startStr}/${endStr}`);
  url.searchParams.append("details", description);
  url.searchParams.append("sf", "true");
  url.searchParams.append("output", "xml");

  window.open(url.toString(), "_blank");
};

export const openOutlookCalendar = (plant: Plant, nextWaterDate: Date) => {
  const { startDate, endDate, title, description } = getEventDetails(plant, nextWaterDate);

  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  url.searchParams.append("subject", title);
  url.searchParams.append("body", description);
  url.searchParams.append("startdt", startDate.toISOString());
  url.searchParams.append("enddt", endDate.toISOString());

  window.open(url.toString(), "_blank");
};

export const downloadIcsFile = (plant: Plant, nextWaterDate: Date) => {
  const { startDate, endDate, title, description } = getEventDetails(plant, nextWaterDate);
  const startStr = formatDateForCalendar(startDate);
  const endStr = formatDateForCalendar(endDate);
  const now = formatDateForCalendar(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EcoGuardian//PlantManager//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTAMP:${now}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `regar_${plant.commonName.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
