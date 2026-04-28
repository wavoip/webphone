---
description: Referência completa da API programática window.wavoip disponível após render().
icon: brackets-curly
---

# API JavaScript

Após `webphone.render()` resolver, o objeto retornado (também disponível como `window.wavoip`) expõe os seguintes namespaces:

```typescript
const api = await webphone.render()

api.call          // Gerenciamento de chamadas
api.device        // Gerenciamento de dispositivos
api.notifications // Gerenciamento de notificações
api.widget        // Controle de abertura/fechamento do widget
api.theme         // Alternância de tema
api.position      // Controle de posição do webphone
api.settings      // Toggles de visibilidade da interface
```

---

## `api.call`

### `call.start(to, config?)`

Inicia uma chamada de saída. Tenta cada dispositivo ativado em sequência.

```typescript
const result = await api.call.start("+5511999999999", {
    fromTokens: ["token-1"],  // Opcional: restringir a dispositivos específicos
    displayName: "Suporte",   // Opcional: nome exibido para o destinatário
})

if (result.err) {
    console.error(result.err.message)
    // result.err.devices: { token: string; reason: string }[]
}
```

---

### `call.getCallActive()`

Retorna o snapshot da chamada ativa atual, ou `undefined` se não houver chamada ativa.

```typescript
const active = api.call.getCallActive()
// { id, type, direction, status, peer, device_token, muted } | undefined
```

---

### `call.getCallOutgoing()`

Retorna o snapshot da chamada de saída atual (chamando, ainda não atendida), ou `undefined`.

```typescript
const outgoing = api.call.getCallOutgoing()
```

---

### `call.getOffers()`

Retorna todas as ofertas de chamadas recebidas pendentes.

```typescript
const offers = api.call.getOffers()
// { id, type, direction, status, peer, device_token, muted }[]
```

---

### `call.onOffer(callback)`

Registra um callback que é disparado sempre que uma nova oferta de chamada recebida chega.

```typescript
api.call.onOffer((offer) => {
    console.log("Chamada recebida de", offer.peer.phone)
})
```

---

### `call.setInput(number)`

Define programaticamente o campo de discagem na interface do webphone.

```typescript
api.call.setInput("+5511999999999")
```

---

## `api.device`

Os dispositivos adicionados aqui são gerenciados pelo widget do webphone. Dispositivos persistentes sobrevivem a recarregamentos de página (armazenados no `localStorage` sob a chave `wavoip:tokens`).

### `device.add(token, persist)`

Adiciona um dispositivo. Passe `persist: true` para salvar entre recarregamentos.

```typescript
api.device.add("meu-token", true)
// Alias: api.device.addDevice(token, persist)
```

---

### `device.remove(token)`

Remove um dispositivo e o desconecta.

```typescript
api.device.remove("meu-token")
// Alias: api.device.removeDevice(token)
```

---

### `device.enable(token)` / `device.disable(token)`

Ativa ou desativa um dispositivo para chamadas de saída sem removê-lo.

```typescript
api.device.enable("meu-token")
api.device.disable("meu-token")
// Aliases: api.device.enableDevice / api.device.disableDevice
```

---

### `device.get()`

Retorna a lista de dispositivos atual incluindo status e estado de ativação.

```typescript
const devices = api.device.get()
// DeviceState[]: { token, status, qrCode, contact, enable, persist }[]
// Alias: api.device.getDevices()
```

---

## `api.widget`

### `widget.open()` / `widget.close()` / `widget.toggle()`

Controla a visibilidade do painel do widget.

```typescript
api.widget.open()
api.widget.close()
api.widget.toggle()
```

---

### `widget.isOpen`

Booleano — indica se o painel do widget está aberto no momento.

```typescript
if (api.widget.isOpen) { ... }
```

---

### `widget.buttonPosition.set(position)`

Move o botão flutuante de alternância.

```typescript
api.widget.buttonPosition.set("bottom-left")
api.widget.buttonPosition.set({ x: 20, y: 20 })
```

---

## `api.theme`

### `theme.set(theme)` / `theme.setTheme(theme)`

Altera o esquema de cores.

```typescript
api.theme.set("dark")    // "dark" | "light" | "system"
```

---

### `theme.value`

String do tema ativo atual.

```typescript
console.log(api.theme.value)  // "dark" | "light" | "system"
```

---

## `api.position`

### `position.set(position)`

Move o painel do webphone.

```typescript
api.position.set("top-right")
api.position.set({ x: 100, y: 200 })
```

---

### `position.value`

Posição atual do painel como `{ x: number; y: number }`.

---

## `api.notifications`

As notificações são armazenadas no `localStorage` sob a chave `webphone_notifications` e persistem entre recarregamentos (até 100 entradas).

### `notifications.add(notification)`

Adiciona uma notificação ao painel de histórico.

```typescript
api.notifications.add({
    id: new Date(),
    type: "INFO",              // "INFO" | "CALL_FAILED"
    message: "Chamada encerrada",
    detail: "Duração: 2m 14s",
    token: "token-do-dispositivo",
    isRead: false,
    isHidden: false,
    created_at: new Date(),
})
// Alias: api.notifications.addNotification(notification)
```

---

### `notifications.get()`

Retorna todas as notificações armazenadas.

```typescript
const all = api.notifications.get()
// Alias: api.notifications.getNotifications()
```

---

### `notifications.remove(id)`

Remove uma notificação específica pelo seu `id` (um objeto `Date`).

```typescript
api.notifications.remove(notification.id)
// Alias: api.notifications.removeNotification(id)
```

---

### `notifications.clear()`

Remove todas as notificações.

```typescript
api.notifications.clear()
// Alias: api.notifications.clearNotifications()
```

---

### `notifications.read()`

Marca todas as notificações como lidas.

```typescript
api.notifications.read()
// Alias: api.notifications.readNotifications()
```

---

## `api.settings`

Alterna a visibilidade dos controles da interface em tempo de execução.

| Setter | Padrão | Efeito |
|--------|--------|--------|
| `setShowNotifications(bool)` | `true` | Exibe/oculta o ícone de notificações |
| `setShowSettings(bool)` | `true` | Exibe/oculta o ícone de configurações |
| `setShowDevices(bool)` | `true` | Exibe/oculta a seção de dispositivos |
| `setShowAddDevices(bool)` | `true` | Exibe/oculta a opção "Adicionar dispositivo" |
| `setShowEnableDevices(bool)` | `true` | Exibe/oculta o toggle ativar/desativar |
| `setShowRemoveDevices(bool)` | `true` | Exibe/oculta a opção "Remover dispositivo" |
| `setShowWidgetButton(bool)` | `true` | Exibe/oculta o botão flutuante de alternância |

```typescript
api.settings.setShowAddDevices(false)   // Oculta "Adicionar dispositivo" da interface
api.settings.setShowWidgetButton(false)  // Oculta o botão flutuante completamente
```

Cada setter tem uma propriedade de leitura correspondente (ex.: `api.settings.showAddDevices`).
