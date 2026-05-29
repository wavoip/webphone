---
description: Tela de diagnóstico para investigar problemas de chamada e gerar relatórios para o suporte.
icon: stethoscope
---

# Diagnóstico de chamada

O Webphone expõe uma aba **Diagnóstico** dentro das Configurações que reúne, em um único lugar, as informações que o suporte precisa para investigar falhas de chamada. Ela é abastecida pelos eventos `iceDiagnostics` e `connectivityIssue` emitidos pelo `@wavoip/wavoip-api`.

## Como abrir

1. Clique no ícone de engrenagem para abrir **Configurações**.
2. Selecione a aba **Diagnóstico**.

## O que a tela mostra

| Seção                  | Conteúdo                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **Navegador**          | `User-Agent` completo. Útil para identificar versão de Chromium/Firefox/Safari.                          |
| **Rede**               | Estado online, tipo de conexão (`4g`, `wifi`...), downlink estimado e RTT (quando o navegador expõe).    |
| **Áudio**              | Permissão atual do microfone, contagem de entradas/saídas.                                              |
| **Reachability STUN**  | Botão para testar os STUNs padrão em paralelo via `runStunProbe` e exibir reachable/latência por servidor. |
| **ICE**                | Último `iceDiagnostics` recebido (duração, candidatos por tipo, `stunReached`, `turnReached`).            |
| **Problemas recentes** | Lista das últimas ocorrências de `connectivityIssue` (até 20), com timestamp.                            |

## Banner em chamada

Durante uma chamada, sempre que `connectivityIssue` for emitido, o Webphone exibe um banner traduzido (pt-BR / en / es) com a opção **Abrir diagnóstico**, que leva o usuário direto para a tela acima.

## Copiar relatório

O botão **Copiar relatório** envia para a área de transferência um JSON com todas as seções já carregadas — para colar em chamados/tickets de suporte.

```json
{
  "generatedAt": "2026-05-29T13:00:00.000Z",
  "system": { "userAgent": "...", "online": true, "network": { ... }, "audioInputs": [...], "audioOutputs": [...], "microphonePermission": "granted" },
  "stunResults": [ { "server": "stun:stun.l.google.com:19302", "reachable": true, "latencyMs": 42 } ],
  "lastIceDiagnostics": { "gatheringDurationMs": 240, "gatheringTimedOut": false, "candidatesByType": { ... }, "stunReached": true, "turnReached": false },
  "recentIssues": [ { "at": 1717012345678, "issue": "STUN_UNREACHABLE" } ]
}
```

## Catálogo de problemas

Para a descrição detalhada de cada `connectivityIssue` (STUN_UNREACHABLE, ICE_GATHERING_TIMEOUT, ICE_CONNECTION_FAILED, NO_HOST_CANDIDATES, SYMMETRIC_NAT_SUSPECTED), consulte a página [Solução de Problemas](https://wavoip.github.io/wavoip-api/troubleshooting) do `@wavoip/wavoip-api`.
