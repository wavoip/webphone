---
description: Drop-in webphone widget for Wavoip devices — renders in an isolated Shadow DOM with a full programmatic API.
icon: phone
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# wavoip-webphone

`@wavoip/wavoip-webphone` is a pre-built, fully isolated phone widget that runs inside your web application. One function call renders a floating webphone that handles incoming and outgoing WhatsApp calls — no layout changes to your page.

{% hint style="info" %}
Version **1.3.2** — built on `@wavoip/wavoip-api` v2.x.
{% endhint %}

## Features

* Floating widget with draggable button — configurable position
* Incoming call notifications with accept / reject
* Outgoing call dialer with DTMF keypad
* Device management UI (add, remove, enable, disable)
* Dark / light / system theme
* Fully isolated in Shadow DOM — zero style conflicts with your app
* Programmatic `window.wavoip` API for automation from external scripts

## Quick start

{% tabs %}
{% tab title="ES Module" %}
```typescript
import webphone from "@wavoip/wavoip-webphone"

// Render the widget and get the API
const api = await webphone.render({
    theme: "system",
    position: "bottom-right",
})

// Add a device
api.device.add("your-device-token", true)

// Tear down
webphone.destroy()
```
{% endtab %}

{% tab title="CDN" %}
```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
<script>
    window.wavoipWebphone.render({ theme: "system" }).then((api) => {
        api.device.add("your-device-token", true)
    })
</script>
```
{% endtab %}
{% endtabs %}

## Explore the docs

<table data-view="cards">
    <thead>
        <tr>
            <th>Section</th>
            <th data-card-target data-type="content-ref">Link</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Install the package</td>
            <td><a href="getting-started/installation.md">Installation</a></td>
        </tr>
        <tr>
            <td>Configure &amp; mount</td>
            <td><a href="getting-started/initialization.md">Initialization</a></td>
        </tr>
        <tr>
            <td>JavaScript API reference</td>
            <td><a href="api.md">JavaScript API</a></td>
        </tr>
        <tr>
            <td>Customize colors</td>
            <td><a href="theming.md">Theming</a></td>
        </tr>
    </tbody>
</table>
