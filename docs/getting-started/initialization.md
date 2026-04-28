---
description: Monte e configure o widget do webphone, em seguida acesse a API programática.
icon: rocket
---

# Inicialização

## `render(config?)`

Monta o widget do webphone na página. Retorna uma promise que resolve para o objeto `WebphoneAPI` assim que o widget estiver totalmente inicializado.

```typescript
import webphone from "@wavoip/wavoip-webphone"

const api = await webphone.render({
    theme: "system",
    position: "bottom-right",
    buttonPosition: "bottom-right",
})
```

Chamar `render()` mais de uma vez é seguro — a segunda chamada retorna a API existente sem remontar o widget.

Após `render()` resolver, `window.wavoip` também é definido com o mesmo objeto de API, tornando-o acessível a partir de scripts que não utilizam módulos.

---

## `destroy()`

Desmonta o widget e limpa `window.wavoip`.

```typescript
webphone.destroy()
```

---

## Configuração (`WebphoneSettings`)

Todos os campos são opcionais.

### `theme`

```typescript
theme?: "dark" | "light" | "system"  // padrão: "system"
```

Controla o esquema de cores. `"system"` segue a preferência do sistema operacional.

---

### `position`

Define onde o painel do webphone aparece na tela.

```typescript
position?: WebphonePosition
```

| Valor            | Descrição                        |
| ---------------- | -------------------------------- |
| `"top"`          | Centro superior                  |
| `"bottom"`       | Centro inferior                  |
| `"left"`         | Centro esquerdo                  |
| `"right"`        | Centro direito                   |
| `"top-left"`     | Canto superior esquerdo          |
| `"top-right"`    | Canto superior direito           |
| `"bottom-left"`  | Canto inferior esquerdo          |
| `"bottom-right"` | Canto inferior direito           |
| `"center"`       | Centralizado na tela             |
| `{ x, y }`       | Coordenadas exatas em pixels     |

---

### `buttonPosition`

Define onde o botão flutuante de alternância aparece.

```typescript
buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | { x: number; y: number }
```

---

### `widget`

```typescript
widget?: {
    showWidgetButton?: boolean   // Exibe o botão flutuante. Padrão: true
    startOpen?: boolean          // Abre o webphone na primeira renderização. Padrão: false
}
```

---

### `statusBar`

Controla os ícones na barra de status superior.

```typescript
statusBar?: {
    showNotificationsIcon?: boolean  // Padrão: true
    showSettingsIcon?: boolean       // Padrão: true
}
```

---

### `settingsMenu`

Controla quais opções aparecem no menu de configurações.

```typescript
settingsMenu?: {
    deviceMenu?: {
        show?: boolean                      // Exibe a seção de gerenciamento de dispositivos. Padrão: true
        showAddDevices?: boolean            // Exibe o botão "Adicionar dispositivo". Padrão: true
        showEnableDevicesButton?: boolean   // Exibe o toggle ativar/desativar. Padrão: true
        showRemoveDevicesButton?: boolean   // Exibe o botão "Remover". Padrão: true
    }
}
```

---

### `callSettings`

```typescript
callSettings?: {
    displayName?: string  // Nome exibido para a parte chamada
}
```

---

### `platform`

```typescript
platform?: string  // Identifica a plataforma do cliente — enviado ao servidor Wavoip na conexão
```

---

## Exemplo de configuração completa

```typescript
const api = await webphone.render({
    theme: "dark",
    position: "bottom-right",
    buttonPosition: "bottom-right",
    widget: {
        showWidgetButton: true,
        startOpen: false,
    },
    statusBar: {
        showNotificationsIcon: true,
        showSettingsIcon: true,
    },
    settingsMenu: {
        deviceMenu: {
            show: true,
            showAddDevices: false,        // Oculta "Adicionar dispositivo" — gerencie dispositivos programaticamente
            showEnableDevicesButton: true,
            showRemoveDevicesButton: false,
        },
    },
    callSettings: {
        displayName: "Equipe de Suporte",
    },
    platform: "meu-crm-v2",
})

// Adiciona o primeiro dispositivo após o render
api.device.add("seu-token-de-dispositivo", true)
```
