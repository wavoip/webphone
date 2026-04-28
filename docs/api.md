---
description: Complete reference for the window.wavoip programmatic API available after render().
icon: brackets-curly
---

# JavaScript API

After `webphone.render()` resolves, the returned object (also available as `window.wavoip`) exposes the following namespaces:

```typescript
const api = await webphone.render()

api.call          // Call management
api.device        // Device management
api.notifications // Notification management
api.widget        // Widget open/close control
api.theme         // Theme switching
api.position      // Webphone position control
api.settings      // UI visibility toggles
```

---

## `api.call`

### `call.start(to, config?)`

Initiates an outgoing call. Tries each enabled device in sequence.

```typescript
const result = await api.call.start("+5511999999999", {
    fromTokens: ["token-1"],  // Optional: restrict to specific devices
    displayName: "Support",   // Optional: display name shown to recipient
})

if (result.err) {
    console.error(result.err.message)
    // result.err.devices: { token: string; reason: string }[]
}
```

---

### `call.getCallActive()`

Returns the current active call snapshot, or `undefined` if no call is active.

```typescript
const active = api.call.getCallActive()
// { id, type, direction, status, peer, device_token, muted } | undefined
```

---

### `call.getCallOutgoing()`

Returns the current outgoing call snapshot (ringing, not yet answered), or `undefined`.

```typescript
const outgoing = api.call.getCallOutgoing()
```

---

### `call.getOffers()`

Returns all pending incoming call offers.

```typescript
const offers = api.call.getOffers()
// { id, type, direction, status, peer, device_token, muted }[]
```

---

### `call.onOffer(callback)`

Register a callback that fires whenever a new incoming call offer arrives.

```typescript
api.call.onOffer((offer) => {
    console.log("Incoming call from", offer.peer.phone)
})
```

---

### `call.setInput(number)`

Programmatically set the dial input field in the webphone UI.

```typescript
api.call.setInput("+5511999999999")
```

---

## `api.device`

Devices added here are managed by the webphone widget. Persistent devices survive page reloads (stored in `localStorage` under the key `wavoip:tokens`).

### `device.add(token, persist)`

Add a device. Pass `persist: true` to save it across reloads.

```typescript
api.device.add("my-token", true)
// Alias: api.device.addDevice(token, persist)
```

---

### `device.remove(token)`

Remove a device and disconnect it.

```typescript
api.device.remove("my-token")
// Alias: api.device.removeDevice(token)
```

---

### `device.enable(token)` / `device.disable(token)`

Enable or disable a device for outgoing calls without removing it.

```typescript
api.device.enable("my-token")
api.device.disable("my-token")
// Aliases: api.device.enableDevice / api.device.disableDevice
```

---

### `device.get()`

Returns the current device list including their status and enabled state.

```typescript
const devices = api.device.get()
// DeviceState[]: { token, status, qrCode, contact, enable, persist }[]
// Alias: api.device.getDevices()
```

---

## `api.widget`

### `widget.open()` / `widget.close()` / `widget.toggle()`

Control the widget panel visibility.

```typescript
api.widget.open()
api.widget.close()
api.widget.toggle()
```

---

### `widget.isOpen`

Boolean — whether the widget panel is currently open.

```typescript
if (api.widget.isOpen) { ... }
```

---

### `widget.buttonPosition.set(position)`

Move the floating toggle button.

```typescript
api.widget.buttonPosition.set("bottom-left")
api.widget.buttonPosition.set({ x: 20, y: 20 })
```

---

## `api.theme`

### `theme.set(theme)` / `theme.setTheme(theme)`

Switch the colour scheme.

```typescript
api.theme.set("dark")    // "dark" | "light" | "system"
```

---

### `theme.value`

Current active theme string.

```typescript
console.log(api.theme.value)  // "dark" | "light" | "system"
```

---

## `api.position`

### `position.set(position)`

Move the webphone panel.

```typescript
api.position.set("top-right")
api.position.set({ x: 100, y: 200 })
```

---

### `position.value`

Current panel position as `{ x: number; y: number }`.

---

## `api.notifications`

Notifications are stored in `localStorage` under the key `webphone_notifications` and persist across reloads (up to 100 entries).

### `notifications.add(notification)`

Add a notification to the history panel.

```typescript
api.notifications.add({
    id: new Date(),
    type: "INFO",              // "INFO" | "CALL_FAILED"
    message: "Call ended",
    detail: "Duration: 2m 14s",
    token: "device-token",
    isRead: false,
    isHidden: false,
    created_at: new Date(),
})
// Alias: api.notifications.addNotification(notification)
```

---

### `notifications.get()`

Returns all stored notifications.

```typescript
const all = api.notifications.get()
// Alias: api.notifications.getNotifications()
```

---

### `notifications.remove(id)`

Remove a specific notification by its `id` (a `Date` object).

```typescript
api.notifications.remove(notification.id)
// Alias: api.notifications.removeNotification(id)
```

---

### `notifications.clear()`

Remove all notifications.

```typescript
api.notifications.clear()
// Alias: api.notifications.clearNotifications()
```

---

### `notifications.read()`

Mark all notifications as read.

```typescript
api.notifications.read()
// Alias: api.notifications.readNotifications()
```

---

## `api.settings`

Toggle UI control visibility at runtime.

| Setter | Default | Effect |
|--------|---------|--------|
| `setShowNotifications(bool)` | `true` | Show/hide the notifications icon |
| `setShowSettings(bool)` | `true` | Show/hide the settings icon |
| `setShowDevices(bool)` | `true` | Show/hide the devices section |
| `setShowAddDevices(bool)` | `true` | Show/hide the "Add device" option |
| `setShowEnableDevices(bool)` | `true` | Show/hide the enable/disable toggle |
| `setShowRemoveDevices(bool)` | `true` | Show/hide the "Remove device" option |
| `setShowWidgetButton(bool)` | `true` | Show/hide the floating toggle button |

```typescript
api.settings.setShowAddDevices(false)   // Hide "Add device" from UI
api.settings.setShowWidgetButton(false)  // Hide the floating button entirely
```

Each setter has a corresponding read property (e.g. `api.settings.showAddDevices`).
