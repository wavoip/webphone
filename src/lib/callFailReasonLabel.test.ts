import { afterEach, describe, expect, it } from "vitest";
import { translateCallFailReason } from "@/lib/callFailReasonLabel";
import { setLanguage } from "@/lib/i18n";

describe("translateCallFailReason", () => {
  afterEach(() => setLanguage("en"));

  it("maps PEER_TX_TIMEOUT to the en label", () => {
    setLanguage("en");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("The contact stopped sending audio");
  });

  it("maps PEER_RX_TIMEOUT to the en label", () => {
    setLanguage("en");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("The user stopped sending audio");
  });

  it("maps the deprecated AUDIO_TIMEOUT to the same label as PEER_RX_TIMEOUT", () => {
    setLanguage("en");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe(translateCallFailReason("PEER_RX_TIMEOUT"));
  });

  it("translates known reasons to pt-BR", () => {
    setLanguage("pt-BR");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("O contato parou de enviar áudio");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("O usuário parou de enviar áudio");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe("O usuário parou de enviar áudio");
    expect(translateCallFailReason("CONNECTION_TIMEOUT")).toBe("A chamada perdeu contato com o servidor");
    expect(translateCallFailReason("ACCOUNT_RESTRICTED")).toBe("Conta do WhatsApp restrita");
    expect(translateCallFailReason("NO_CALL_PERMISSION")).toBe("Conta sem permissão para realizar chamadas");
    expect(translateCallFailReason("CORRUPTED_KEYS")).toBe("Não foi possível estabelecer a chamada com segurança");
    expect(translateCallFailReason("INTERNAL_ERROR")).toBe("Algo deu errado no servidor");
  });

  it("translates known reasons to es", () => {
    setLanguage("es");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("El contacto dejó de enviar audio");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("El usuario dejó de enviar audio");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe("El usuario dejó de enviar audio");
  });

  it("returns the raw reason when it is not in the known set", () => {
    setLanguage("en");
    expect(translateCallFailReason("SOMETHING_NEW_FROM_SERVER")).toBe("SOMETHING_NEW_FROM_SERVER");
  });
});
