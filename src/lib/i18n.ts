import a18nGlobal from "a18n";

export type Language = "en" | "pt-BR" | "es";

export type TranslationKey =
  // restriction
  | "Device restricted"
  | "Restriction lifted"
  | "Restricted"
  // device status
  | "Power on device"
  | "Enable device"
  | "Disable device"
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
  | "Number does not exist"
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
  | "Enter the token"
  // troubleshooting
  | "Preferences"
  | "Theme"
  | "Language"
  | "Light"
  | "Dark"
  | "System"
  | "Pick light, dark, or follow the system"
  | "Switch the webphone interface language"
  | "Diagnostics"
  | "Open diagnostics"
  | "Close"
  | "Copy report"
  | "Test STUN"
  | "Browser"
  | "Network"
  | "Audio devices"
  | "STUN reachability"
  | "Tested at"
  | "Recent issues"
  | "Recent ICE diagnostics"
  | "Call diagnostics"
  | "STUN unreachable"
  | "ICE gathering timed out"
  | "Connection failed"
  | "No host candidates"
  | "Symmetric NAT suspected";

type LocaleResource = Record<TranslationKey, string>;

const a18n = a18nGlobal.getA18n("wavoip-webphone");

const ptBR: LocaleResource = {
  "Device restricted": "Dispositivo restrito",
  "Restriction lifted": "Restrição removida",
  Restricted: "Restrito",
  "Power on device": "Ligar Dispositivo",
  "Enable device": "Ativar dispositivo",
  "Disable device": "Desativar dispositivo",
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
  "Number does not exist": "Número não existe",
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
  Preferences: "Preferências",
  Theme: "Tema",
  Language: "Idioma",
  Light: "Claro",
  Dark: "Escuro",
  System: "Sistema",
  "Pick light, dark, or follow the system": "Escolha claro, escuro ou siga o sistema",
  "Switch the webphone interface language": "Trocar idioma da interface do webphone",
  Diagnostics: "Diagnóstico",
  "Open diagnostics": "Abrir diagnóstico",
  Close: "Fechar",
  "Copy report": "Copiar relatório",
  "Test STUN": "Testar STUN",
  Browser: "Navegador",
  Network: "Rede",
  "Audio devices": "Áudio",
  "STUN reachability": "Reachability STUN",
  "Tested at": "Testado em",
  "Recent issues": "Problemas recentes",
  "Recent ICE diagnostics": "Diagnósticos ICE recentes",
  "Call diagnostics": "Diagnóstico da chamada",
  "STUN unreachable": "STUN inacessível — confira firewall/proxy.",
  "ICE gathering timed out": "Tempo de coleta ICE esgotado — a chamada seguiu com os candidatos disponíveis.",
  "Connection failed": "Conexão de mídia falhou.",
  "No host candidates": "Nenhum candidato local — verifique mDNS/VPN.",
  "Symmetric NAT suspected": "NAT simétrico suspeito — pode bloquear a chamada.",
};

const es: LocaleResource = {
  "Device restricted": "Dispositivo restringido",
  "Restriction lifted": "Restricción levantada",
  Restricted: "Restringido",
  "Power on device": "Encender dispositivo",
  "Enable device": "Activar dispositivo",
  "Disable device": "Desactivar dispositivo",
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
  "Number does not exist": "El número no existe",
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
  Preferences: "Preferencias",
  Theme: "Tema",
  Language: "Idioma",
  Light: "Claro",
  Dark: "Oscuro",
  System: "Sistema",
  "Pick light, dark, or follow the system": "Elige claro, oscuro o seguir el sistema",
  "Switch the webphone interface language": "Cambiar el idioma de la interfaz del webphone",
  Diagnostics: "Diagnóstico",
  "Open diagnostics": "Abrir diagnóstico",
  Close: "Cerrar",
  "Copy report": "Copiar informe",
  "Test STUN": "Probar STUN",
  Browser: "Navegador",
  Network: "Red",
  "Audio devices": "Audio",
  "STUN reachability": "Alcance STUN",
  "Tested at": "Probado a las",
  "Recent issues": "Problemas recientes",
  "Recent ICE diagnostics": "Diagnósticos ICE recientes",
  "Call diagnostics": "Diagnóstico de la llamada",
  "STUN unreachable": "STUN inalcanzable — revisa firewall/proxy.",
  "ICE gathering timed out": "Tiempo de recolección ICE agotado — la llamada continuó con los candidatos disponibles.",
  "Connection failed": "La conexión de medios falló.",
  "No host candidates": "Sin candidatos locales — revisa mDNS/VPN.",
  "Symmetric NAT suspected": "NAT simétrico sospechado — puede bloquear la llamada.",
};

a18n.addLocaleResource("pt-BR", ptBR);
a18n.addLocaleResource("es", es);

export const t = (key: TranslationKey): string => a18n(key);

const localeSubscribers = new Set<() => void>();

export const setLanguage = (lang: Language): void => {
  a18n.setLocale(lang);
  for (const cb of localeSubscribers) cb();
};

export const getLanguage = (): string => a18n.getLocale();

const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "pt-BR", "es"];

/**
 * Map an arbitrary BCP-47 tag (e.g. "en-US", "pt", "es-419") to one of the
 * languages we ship translations for. Falls back to "en".
 */
export const normalizeLanguage = (raw: string | null | undefined): Language => {
  if (!raw) return "en";
  const exact = SUPPORTED_LANGUAGES.find((l) => l === raw);
  if (exact) return exact;
  const base = raw.toLowerCase().split("-")[0];
  if (base === "pt") return "pt-BR";
  if (base === "es") return "es";
  return "en";
};

export const subscribeLocale = (cb: () => void): (() => void) => {
  localeSubscribers.add(cb);
  return () => {
    localeSubscribers.delete(cb);
  };
};
