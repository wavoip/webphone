import { afterEach, describe, expect, it } from "vitest";
import { setLanguage, t } from "@/lib/i18n";

describe("webphone i18n", () => {
  afterEach(() => setLanguage("en"));

  it("returns source key when locale is en", () => {
    setLanguage("en");
    expect(t("Device restricted")).toBe("Device restricted");
  });

  it("returns pt-BR translation when locale is pt-BR", () => {
    setLanguage("pt-BR");
    expect(t("Device restricted")).toBe("Dispositivo restrito");
    expect(t("Restriction lifted")).toBe("Restrição removida");
    expect(t("Restricted")).toBe("Restrito");
    expect(t("Cancel")).toBe("Cancelar");
    expect(t("Notifications")).toBe("Notificações");
    expect(t("Calling...")).toBe("Chamando...");
  });

  it("returns es translation when locale is es", () => {
    setLanguage("es");
    expect(t("Device restricted")).toBe("Dispositivo restringido");
    expect(t("Restriction lifted")).toBe("Restricción levantada");
    expect(t("Restricted")).toBe("Restringido");
    expect(t("Cancel")).toBe("Cancelar");
    expect(t("Notifications")).toBe("Notificaciones");
    expect(t("Calling...")).toBe("Llamando...");
  });

  // Regressão: os rótulos dos controles em chamada estavam fixos em português e
  // apareciam misturados com "End" quando o navegador estava em inglês.
  it.each([
    ["en", ["Hold", "Video", "Mute", "Unmute", "Transfer", "Keypad", "Muted", "Audio"]],
    ["pt-BR", ["Espera", "Vídeo", "Silenciar", "Falar", "Transferir", "Teclado", "Silenciado", "Áudio"]],
    ["es", ["Espera", "Vídeo", "Silenciar", "Hablar", "Transferir", "Teclado", "Silenciado", "Audio"]],
  ] as const)("translates in-call control labels for %s", (lang, expected) => {
    setLanguage(lang);
    const keys = ["Hold", "Video", "Mute", "Unmute", "Transfer", "Keypad", "Muted", "Audio"] as const;
    expect(keys.map((key) => t(key))).toEqual(expected);
  });
});
