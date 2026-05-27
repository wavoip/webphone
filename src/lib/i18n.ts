import a18nGlobal from "a18n";

export type Language = "en" | "pt-BR" | "es";

export type TranslationKey =
  // restriction
  | "Device restricted"
  | "Restriction lifted"
  | "Restricted"
  // device status
  | "Power on device"
  | "Disconnected"
  | "Waiting to link WhatsApp"
  | "Failed"
  | "Show QR Code"
  | "Delete this device?"
  | "Delete"
  | "Cancel"
  // devices alert
  | "Disconnected devices"
  | "Devices waiting for QR code"
  | "Closed devices"
  | "Hibernating devices"
  | "Devices with errors"
  // notifications
  | "Missed call"
  | "Call failed"
  | "Notice"
  | "Notifications"
  | "No notifications"
  | "Unread"
  | "Remove notification"
  | "Clear"
  // offer / missed call
  | "Call ended"
  | "Accepted by another user"
  | "Rejected by the app"
  | "Timed out"
  | "Unknown"
  // keyboard / outgoing
  | "Calling from"
  | "No device available"
  | "Type..."
  | "Connecting..."
  | "Calling..."
  | "The call failed"
  | "Call rejected"
  | "Call unanswered"
  // settings
  | "Microphone"
  | "Select the microphone to use on calls"
  | "Speaker"
  | "Select the speaker to use on calls"
  | "Settings"
  | "Here you can configure the entire webphone"
  | "Point your phone camera"
  | "Numbers"
  | "Enter the token";

type LocaleResource = Record<TranslationKey, string>;

const a18n = a18nGlobal.getA18n("wavoip-webphone");

const ptBR: LocaleResource = {
  "Device restricted": "Dispositivo restrito",
  "Restriction lifted": "Restrição removida",
  Restricted: "Restrito",
  "Power on device": "Ligar Dispositivo",
  Disconnected: "Desconectado",
  "Waiting to link WhatsApp": "Aguardando vincular Whatsapp",
  Failed: "Falha",
  "Show QR Code": "Mostrar QRCode",
  "Delete this device?": "Deseja excluir esse dispositivo?",
  Delete: "Excluir",
  Cancel: "Cancelar",
  "Disconnected devices": "Dispositivos desconectados",
  "Devices waiting for QR code": "Dispositivos para ler QRCode",
  "Closed devices": "Dispositivos fechados",
  "Hibernating devices": "Dispositivos hibernando",
  "Devices with errors": "Dispositivos com erro",
  "Missed call": "Chamada perdida",
  "Call failed": "Ligação falhou",
  Notice: "Aviso",
  Notifications: "Notificações",
  "No notifications": "Nenhuma notificação",
  Unread: "não lida",
  "Remove notification": "Remover notificação",
  Clear: "Limpar",
  "Call ended": "Chamada encerrada",
  "Accepted by another user": "Aceita por outro usuário",
  "Rejected by the app": "Rejeitada pelo aplicativo",
  "Timed out": "Tempo limite",
  Unknown: "Desconhecido",
  "Calling from": "Ligando de",
  "No device available": "Nenhum dispositivo está disponível",
  "Type...": "Digite...",
  "Connecting...": "Ligando...",
  "Calling...": "Chamando...",
  "The call failed": "A ligação falhou",
  "Call rejected": "Chamada rejeitada",
  "Call unanswered": "Chamada não atendida",
  Microphone: "Microfone",
  "Select the microphone to use on calls": "Selecione o microfone que deseja usar na ligação",
  Speaker: "Alto falante",
  "Select the speaker to use on calls": "Selecione o alto falante que deseja usar na ligação",
  Settings: "Configurações",
  "Here you can configure the entire webphone": "Aqui você pode configurar todo webphone",
  "Point your phone camera": "Aponte a câmera do celular",
  Numbers: "Números",
  "Enter the token": "Informe o Token",
};

const es: LocaleResource = {
  "Device restricted": "Dispositivo restringido",
  "Restriction lifted": "Restricción levantada",
  Restricted: "Restringido",
  "Power on device": "Encender dispositivo",
  Disconnected: "Desconectado",
  "Waiting to link WhatsApp": "Esperando vincular WhatsApp",
  Failed: "Fallo",
  "Show QR Code": "Mostrar código QR",
  "Delete this device?": "¿Eliminar este dispositivo?",
  Delete: "Eliminar",
  Cancel: "Cancelar",
  "Disconnected devices": "Dispositivos desconectados",
  "Devices waiting for QR code": "Dispositivos esperando código QR",
  "Closed devices": "Dispositivos cerrados",
  "Hibernating devices": "Dispositivos hibernando",
  "Devices with errors": "Dispositivos con error",
  "Missed call": "Llamada perdida",
  "Call failed": "Llamada fallida",
  Notice: "Aviso",
  Notifications: "Notificaciones",
  "No notifications": "Sin notificaciones",
  Unread: "no leída",
  "Remove notification": "Eliminar notificación",
  Clear: "Limpiar",
  "Call ended": "Llamada finalizada",
  "Accepted by another user": "Aceptada por otro usuario",
  "Rejected by the app": "Rechazada por la aplicación",
  "Timed out": "Tiempo agotado",
  Unknown: "Desconocido",
  "Calling from": "Llamando desde",
  "No device available": "Ningún dispositivo disponible",
  "Type...": "Escribir...",
  "Connecting...": "Conectando...",
  "Calling...": "Llamando...",
  "The call failed": "La llamada falló",
  "Call rejected": "Llamada rechazada",
  "Call unanswered": "Llamada no contestada",
  Microphone: "Micrófono",
  "Select the microphone to use on calls": "Selecciona el micrófono que deseas usar en la llamada",
  Speaker: "Altavoz",
  "Select the speaker to use on calls": "Selecciona el altavoz que deseas usar en la llamada",
  Settings: "Configuración",
  "Here you can configure the entire webphone": "Aquí puedes configurar todo el webphone",
  "Point your phone camera": "Apunta la cámara del móvil",
  Numbers: "Números",
  "Enter the token": "Introduce el token",
};

a18n.addLocaleResource("pt-BR", ptBR);
a18n.addLocaleResource("es", es);

export const t = (key: TranslationKey): string => a18n(key);

export const setLanguage = (lang: Language): void => a18n.setLocale(lang);

export const getLanguage = (): string => a18n.getLocale();
