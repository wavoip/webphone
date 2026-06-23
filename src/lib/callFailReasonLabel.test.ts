import { afterEach, describe, expect, it } from "vitest";
import { translateCallFailReason } from "@/lib/callFailReasonLabel";
import { setLanguage } from "@/lib/i18n";

describe("translateCallFailReason", () => {
  afterEach(() => setLanguage("en"));

  it("maps PEER_TX_TIMEOUT to the peer-audio-timeout label", () => {
    setLanguage("en");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("Peer audio timeout");
  });

  it("maps PEER_RX_TIMEOUT to the user-audio-timeout label", () => {
    setLanguage("en");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("User audio timeout");
  });

  it("maps the deprecated AUDIO_TIMEOUT to the same label as PEER_RX_TIMEOUT", () => {
    setLanguage("en");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe(translateCallFailReason("PEER_RX_TIMEOUT"));
  });

  it("translates known reasons to pt-BR", () => {
    setLanguage("pt-BR");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("Sem áudio do contato");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("Sem áudio do usuário");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe("Sem áudio do usuário");
    expect(translateCallFailReason("CONNECTION_TIMEOUT")).toBe("Tempo de conexão esgotado");
    expect(translateCallFailReason("ACCOUNT_RESTRICTED")).toBe("Conta restrita");
    expect(translateCallFailReason("NO_CALL_PERMISSION")).toBe("Sem permissão para chamada");
    expect(translateCallFailReason("CORRUPTED_KEYS")).toBe("Chaves corrompidas");
    expect(translateCallFailReason("INTERNAL_ERROR")).toBe("Erro interno");
  });

  it("translates known reasons to es", () => {
    setLanguage("es");
    expect(translateCallFailReason("PEER_TX_TIMEOUT")).toBe("Sin audio del contacto");
    expect(translateCallFailReason("PEER_RX_TIMEOUT")).toBe("Sin audio del usuario");
    expect(translateCallFailReason("AUDIO_TIMEOUT")).toBe("Sin audio del usuario");
  });

  it("returns the raw reason when it is not in the known set", () => {
    setLanguage("en");
    expect(translateCallFailReason("SOMETHING_NEW_FROM_SERVER")).toBe("SOMETHING_NEW_FROM_SERVER");
  });
});
