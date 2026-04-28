---
description: Add @wavoip/wavoip-webphone to your project.
icon: download
---

# Installation

## Requirements

* A modern browser with WebRTC support (Chrome 80+, Firefox 75+, Safari 14.1+)
* One or more Wavoip device tokens from the [Wavoip control panel](https://wavoip.com)

## Install via package manager

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="npm" %}
```bash
npm install @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @wavoip/wavoip-webphone
```
{% endtab %}
{% endtabs %}

## Install via CDN

No build step required — include the UMD bundle directly in any HTML page.

```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
```

The widget is available as `window.wavoipWebphone` after the script loads.

```html
<script>
    window.wavoipWebphone.render().then((api) => {
        api.device.add("your-device-token", false)
    })
</script>
```

{% hint style="info" %}
For production, pin to a specific version instead of `@latest` to avoid unexpected breaking changes:
`/npm/@wavoip/wavoip-webphone@1.3.2/dist/index.umd.min.js`
{% endhint %}
