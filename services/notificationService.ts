import { Alert } from "../types";

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log("Este navegador não suporta notificações desktop");
    return;
  }
  
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png', // Assuming pwa icon
      badge: '/icon-192.png'
    });
  }
};

export const processAlertsForNotifications = (alerts: Alert[]) => {
  // Simple throttle: Only send one summary notification or specific critical ones
  // to avoid spamming the user.
  
  const dangerAlerts = alerts.filter(a => a.type === 'danger');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const waterAlerts = alerts.filter(a => a.message.includes('Hora de regar'));

  if (dangerAlerts.length > 0) {
    sendNotification(
      "Alertas Críticos de Plantas!", 
      `Ação necessária para ${dangerAlerts.length} plantas. Verifique o EcoGuardian.`
    );
    return;
  }

  if (warningAlerts.length > 0) {
    sendNotification(
      "Aviso Meteorológico", 
      `Condições mudando. ${warningAlerts.length} plantas podem precisar de atenção.`
    );
    return;
  }

  if (waterAlerts.length > 0) {
    sendNotification(
      "Hora da Rega", 
      `Você tem ${waterAlerts.length} plantas para regar hoje.`
    );
  }
};