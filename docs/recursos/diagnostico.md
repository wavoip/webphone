---
description: Telas de diagnóstico para investigar problemas de chamada e gerar relatórios para o suporte.
icon: stethoscope
---

# Diagnóstico de chamada

O Webphone expõe duas superfícies de diagnóstico complementares:

1. **Diagnóstico geral** — aba **Diagnóstico** dentro de **Configurações**. Reúne informações do ambiente e o histórico de eventos `iceDiagnostics` e `connectivityIssue` emitidos pelo `@wavoip/wavoip-api` ao longo da sessão.
2. **Diagnóstico por chamada** — diálogo aberto clicando no indicador de ping (canto inferior esquerdo) durante uma chamada ativa. Mostra estatísticas em tempo real, ICE e problemas filtrados pelo `id` da chamada atual.

## Diagnóstico geral

### Como abrir

1. Clique no ícone de engrenagem para abrir **Configurações**.
2. Selecione a aba **Diagnóstico**.

### Cabeçalho

O topo da tela fica fixo durante a rolagem e mostra:

* Um *pill* com a versão atual do webphone (`v X.Y.Z`).
* O botão **Copiar relatório**, que envia para a área de transferência um JSON com todas as seções já carregadas.

### Seções

| Seção                          | Conteúdo                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navegador**                  | `User-Agent` completo. Útil para identificar versão de Chromium/Firefox/Safari.                                                                   |
| **Rede**                       | Estado online (com indicador colorido), tipo de conexão (`4g`, `wifi`...), downlink estimado e RTT (quando o navegador expõe).                    |
| **Áudio**                      | Permissão atual do microfone, contagem de entradas/saídas.                                                                                        |
| **Reachability STUN**          | Botão para testar os STUNs padrão em paralelo via `runStunProbe`. Após executar, exibe **Testado em** seguido do timestamp formatado e o resultado por servidor (reachable/latência). |
| **Diagnósticos ICE recentes**  | Lista os últimos eventos `iceDiagnostics` (até 20) com timestamp formatado e o `id` da chamada que os emitiu.                                     |
| **Problemas recentes**         | Lista as últimas ocorrências de `connectivityIssue` (até 20), com timestamp, `id` da chamada e o código do problema.                              |

### Banner em chamada

Durante uma chamada, sempre que `connectivityIssue` for emitido, o Webphone exibe um banner traduzido (pt-BR / en / es) com a opção **Abrir diagnóstico**, que leva o usuário direto para a aba acima.

### Schema do relatório

O botão **Copiar relatório** copia um JSON com a forma:

```json
{
  "generatedAt": "2026-05-29T13:00:00.000Z",
  "versions": { "webphone": "1.4.4" },
  "system": {
    "userAgent": "...",
    "online": true,
    "network": { "effectiveType": "4g", "downlinkMbps": 10, "rttMs": 50 },
    "audioInputs": [],
    "audioOutputs": [],
    "microphonePermission": "granted"
  },
  "stunResults": {
    "at": 1717012345678,
    "results": [
      { "server": "stun:stun.l.google.com:19302", "reachable": true, "latencyMs": 42 }
    ]
  },
  "recentIceDiagnostics": [
    {
      "at": 1717012345678,
      "callId": "abc-123",
      "diag": {
        "gatheringDurationMs": 240,
        "gatheringTimedOut": false,
        "candidatesByType": { "host": 2, "srflx": 1, "prflx": 0, "relay": 0 },
        "stunReached": true,
        "turnReached": false
      }
    }
  ],
  "recentIssues": [
    { "at": 1717012345678, "callId": "abc-123", "issue": "STUN_UNREACHABLE" }
  ]
}
```

## Diagnóstico por chamada

Quando há uma chamada ativa, o canto inferior esquerdo exibe um botão **Ping** com o RTT estimado e a força do sinal. Clicar nele abre o diálogo **Diagnóstico da chamada** com três seções, todas filtradas pelo `id` da chamada atual:

| Seção                       | Conteúdo                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Estatísticas em tempo real** | Pull a cada 500 ms via `call.getStats()` (a partir do `@wavoip/wavoip-api` 2.6 — os eventos `stats` / `serverStats` foram depreciados). RTT mín/méd/máx (ms); TX/RX com pacotes, kB, perda %, bitrate (kbps) e nível de áudio; jitter de RX (ms); e latência de saída do `audio_context` (ms). Para chamadas `UNOFFICIAL`, o snapshot já mescla os campos do servidor (RTT cliente/WhatsApp). |
| **ICE**                     | Último payload `iceDiagnostics` recebido para a chamada. Graças ao replay-on-subscribe do `@wavoip/wavoip-api`, o estado completo aparece mesmo abrindo o diálogo após a chamada já ter conectado.                |
| **Problemas recentes**      | Lista de `connectivityIssue` da chamada atual, com timestamp formatado.                                                                                                                                          |

## Catálogo de problemas

Para a descrição detalhada de cada `connectivityIssue` (`STUN_UNREACHABLE`, `ICE_GATHERING_TIMEOUT`, `ICE_CONNECTION_FAILED`, `NO_HOST_CANDIDATES`, `SYMMETRIC_NAT_SUSPECTED`), consulte a página [Solução de Problemas](https://wavoip.github.io/wavoip-api/troubleshooting) do `@wavoip/wavoip-api`.
