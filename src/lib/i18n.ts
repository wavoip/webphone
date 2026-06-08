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
  | "Connected"
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
  | "Test"
  | "Listen"
  | "Stop"
  | "Use headphones to avoid feedback"
  | "Default microphone"
  | "Failed to switch microphone"
  | "Microphone permission required"
  | "Grant permission to list your audio devices"
  | "Grant permission"
  | "Microphone permission denied"
  | "Permission status"
  | "granted"
  | "denied"
  | "prompt"
  | "unknown"
  | "Microphone permission denied. Enable it in your browser settings."
  | "Insecure context"
  | "Webphone requires HTTPS or localhost to list audio devices. Audio names are hidden by the browser."
  | "Secure context"
  | "yes"
  | "no"
  | "Settings"
  | "Here you can configure the entire webphone"
  | "Point your phone camera"
  | "Numbers"
  | "Enter the token"
  | "No devices yet"
  | "About"
  | "Webphone version"
  | "Documentation"
  | "Repository"
  | "Manage your WhatsApp devices"
  | "Microphone, speaker and permission settings"
  | "Version and references";

type LocaleResource = Record<TranslationKey, string>;

const a18n = a18nGlobal.getA18n("wavoip-webphone");

const ptBR: LocaleResource = {
  "Device restricted": "Dispositivo restrito",
  "Restriction lifted": "Restrição removida",
  Restricted: "Restrito",
  "Power on device": "Ligar Dispositivo",
  Disconnected: "Desconectado",
  Connected: "Conectado",
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
  Test: "Testar",
  Listen: "Ouvir",
  Stop: "Parar",
  "Use headphones to avoid feedback": "Use fones de ouvido para evitar microfonia",
  "Default microphone": "Microfone padrão",
  "Failed to switch microphone": "Falha ao trocar o microfone",
  "Microphone permission required": "Permissão de microfone necessária",
  "Grant permission to list your audio devices": "Conceda permissão para listar seus dispositivos de áudio",
  "Grant permission": "Conceder permissão",
  "Microphone permission denied": "Permissão de microfone negada",
  "Permission status": "Status da permissão",
  granted: "concedida",
  denied: "negada",
  prompt: "aguardando",
  unknown: "desconhecida",
  "Microphone permission denied. Enable it in your browser settings.":
    "Permissão de microfone negada. Habilite-a nas configurações do navegador.",
  "Insecure context": "Contexto inseguro",
  "Webphone requires HTTPS or localhost to list audio devices. Audio names are hidden by the browser.":
    "O Webphone precisa de HTTPS ou localhost para listar dispositivos de áudio. Os nomes dos dispositivos são ocultados pelo navegador.",
  "Secure context": "Contexto seguro",
  yes: "sim",
  no: "não",
  Settings: "Configurações",
  "Here you can configure the entire webphone": "Aqui você pode configurar todo webphone",
  "Point your phone camera": "Aponte a câmera do celular",
  Numbers: "Números",
  "Enter the token": "Informe o Token",
  "No devices yet": "Nenhum dispositivo cadastrado",
  About: "Sobre",
  "Webphone version": "Versão do Webphone",
  Documentation: "Documentação",
  Repository: "Repositório",
  "Manage your WhatsApp devices": "Gerencie seus dispositivos do WhatsApp",
  "Microphone, speaker and permission settings": "Configurações de microfone, alto falante e permissões",
  "Version and references": "Versão e referências",
};

const es: LocaleResource = {
  "Device restricted": "Dispositivo restringido",
  "Restriction lifted": "Restricción levantada",
  Restricted: "Restringido",
  "Power on device": "Encender dispositivo",
  Disconnected: "Desconectado",
  Connected: "Conectado",
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
  Test: "Probar",
  Listen: "Escuchar",
  Stop: "Detener",
  "Use headphones to avoid feedback": "Usa auriculares para evitar acoplamiento",
  "Default microphone": "Micrófono predeterminado",
  "Failed to switch microphone": "Error al cambiar el micrófono",
  "Microphone permission required": "Se requiere permiso de micrófono",
  "Grant permission to list your audio devices": "Concede permiso para listar tus dispositivos de audio",
  "Grant permission": "Conceder permiso",
  "Microphone permission denied": "Permiso de micrófono denegado",
  "Permission status": "Estado del permiso",
  granted: "concedido",
  denied: "denegado",
  prompt: "esperando",
  unknown: "desconocido",
  "Microphone permission denied. Enable it in your browser settings.":
    "Permiso de micrófono denegado. Actívalo en la configuración del navegador.",
  "Insecure context": "Contexto inseguro",
  "Webphone requires HTTPS or localhost to list audio devices. Audio names are hidden by the browser.":
    "El Webphone requiere HTTPS o localhost para listar dispositivos de audio. Los nombres son ocultados por el navegador.",
  "Secure context": "Contexto seguro",
  yes: "sí",
  no: "no",
  Settings: "Configuración",
  "Here you can configure the entire webphone": "Aquí puedes configurar todo el webphone",
  "Point your phone camera": "Apunta la cámara del móvil",
  Numbers: "Números",
  "Enter the token": "Introduce el token",
  "No devices yet": "No hay dispositivos",
  About: "Acerca de",
  "Webphone version": "Versión del Webphone",
  Documentation: "Documentación",
  Repository: "Repositorio",
  "Manage your WhatsApp devices": "Gestiona tus dispositivos de WhatsApp",
  "Microphone, speaker and permission settings": "Ajustes de micrófono, altavoz y permisos",
  "Version and references": "Versión y referencias",
};

a18n.addLocaleResource("pt-BR", ptBR);
a18n.addLocaleResource("es", es);

export const t = (key: TranslationKey): string => a18n(key);

export const setLanguage = (lang: Language): void => a18n.setLocale(lang);

export const getLanguage = (): string => a18n.getLocale();
