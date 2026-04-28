---
description: Mount and configure the webphone widget, then access the programmatic API.
icon: rocket
---

# Initialization

## `render(config?)`

Mounts the webphone widget into the page. Returns a promise that resolves to the `WebphoneAPI` object once the widget is fully initialised.

```typescript
import webphone from "@wavoip/wavoip-webphone"

const api = await webphone.render({
    theme: "system",
    position: "bottom-right",
    buttonPosition: "bottom-right",
})
```

Calling `render()` more than once is safe — the second call returns the existing API without re-mounting.

After `render()` resolves, `window.wavoip` is also set to the same API object, making it accessible from non-module scripts.

---

## `destroy()`

Unmounts the widget and clears `window.wavoip`.

```typescript
webphone.destroy()
```

---

## Configuration (`WebphoneSettings`)

All fields are optional.

### `theme`

```typescript
theme?: "dark" | "light" | "system"  // default: "system"
```

Controls the colour scheme. `"system"` follows the OS preference.

---

### `position`

Sets where the webphone panel appears on screen.

```typescript
position?: WebphonePosition
```

| Value           | Description                    |
| --------------- | ------------------------------ |
| `"top"`         | Top-center                     |
| `"bottom"`      | Bottom-center                  |
| `"left"`        | Left-center                    |
| `"right"`       | Right-center                   |
| `"top-left"`    | Top-left corner                |
| `"top-right"`   | Top-right corner               |
| `"bottom-left"` | Bottom-left corner             |
| `"bottom-right"`| Bottom-right corner            |
| `"center"`      | Centered on screen             |
| `{ x, y }`      | Exact pixel coordinates        |

---

### `buttonPosition`

Sets where the floating toggle button appears.

```typescript
buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | { x: number; y: number }
```

---

### `widget`

```typescript
widget?: {
    showWidgetButton?: boolean   // Show the floating button. Default: true
    startOpen?: boolean          // Open the webphone on first render. Default: false
}
```

---

### `statusBar`

Controls icons in the top status bar.

```typescript
statusBar?: {
    showNotificationsIcon?: boolean  // Default: true
    showSettingsIcon?: boolean       // Default: true
}
```

---

### `settingsMenu`

Controls which options appear in the settings menu.

```typescript
settingsMenu?: {
    deviceMenu?: {
        show?: boolean                  // Show the device management section. Default: true
        showAddDevices?: boolean        // Show the "Add device" button. Default: true
        showEnableDevicesButton?: boolean   // Show enable/disable toggle. Default: true
        showRemoveDevicesButton?: boolean   // Show "Remove" button. Default: true
    }
}
```

---

### `callSettings`

```typescript
callSettings?: {
    displayName?: string  // Display name shown to the called party
}
```

---

### `platform`

```typescript
platform?: string  // Identifies the client platform — forwarded to the Wavoip server on connection
```

---

## Full configuration example

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
            showAddDevices: false,        // Hide "Add device" — manage devices programmatically
            showEnableDevicesButton: true,
            showRemoveDevicesButton: false,
        },
    },
    callSettings: {
        displayName: "Support Team",
    },
    platform: "my-crm-v2",
})

// Add the first device after render
api.device.add("your-device-token", true)
```
