---
description: Customise the webphone's colours using CSS custom properties.
icon: palette
---

# Theming

The webphone renders inside a Shadow DOM and uses CSS custom properties (variables) for all colours. You can override these variables to match your brand.

{% hint style="info" %}
Because the widget lives in a Shadow DOM, standard CSS selectors from your page cannot reach its internals. Override variables on the `:host` element via a `<style>` tag injected into the shadow root — or modify `src/assets/index.css` if you are building from source.
{% endhint %}

## Available CSS variables

The widget ships with light and dark palettes. Override any variable in the `:host` or `.dark` scope.

### Light theme (default)

```css
:host {
  --background:            oklch(1 0 0);             /* Main panel background */
  --foreground:            oklch(0.141 0.005 285.823); /* Primary text */
  --card:                  oklch(1 0 0);             /* Card/surface background */
  --card-foreground:       oklch(0.141 0.005 285.823);
  --widget-background:     oklch(72.3% 0.219 149.579); /* Floating button background */
  --widget-background-hover: oklch(62.7% 0.194 149.214);
  --widget-text:           oklch(1 0 0);             /* Floating button icon colour */
  --primary:               oklch(0.723 0.219 149.579); /* Accent / action colour */
  --primary-foreground:    oklch(0.982 0.018 155.826);
  --secondary:             oklch(0.967 0.001 286.375);
  --secondary-foreground:  oklch(0.21 0.006 285.885);
  --muted:                 oklch(0.962 0.004 286.32);
  --muted-foreground:      oklch(0.552 0.016 285.938);
  --accent:                oklch(0.8865 0.0054 286.29);
  --accent-foreground:     oklch(0.21 0.006 285.885);
  --destructive:           oklch(0.577 0.245 27.325); /* Error / hang-up red */
  --border:                oklch(0.92 0.004 286.32);
  --input:                 oklch(0.92 0.004 286.32);
  --ring:                  oklch(0.723 0.219 149.579); /* Focus ring */
  --radius:                0.65rem;                  /* Border radius */
}
```

### Dark theme

```css
:host .dark {
  --background:            oklch(0.2493 0.0114 278.04);
  --foreground:            oklch(0.985 0 0);
  --card:                  oklch(0.21 0.006 285.885);
  --card-foreground:       oklch(0.985 0 0);
  --primary:               oklch(0.696 0.17 162.48);
  --primary-foreground:    oklch(0.393 0.095 152.535);
  --secondary:             oklch(0.274 0.006 286.033);
  --secondary-foreground:  oklch(0.985 0 0);
  --muted:                 oklch(0.2901 0.0092 276.8);
  --muted-foreground:      oklch(0.705 0.015 286.067);
  --accent:                oklch(32.617% 0.00528 286.007);
  --accent-foreground:     oklch(0.985 0 0);
  --destructive:           oklch(0.704 0.191 22.216);
  --border:                oklch(1 0 0 / 10%);
  --input:                 oklch(1 0 0 / 15%);
  --ring:                  oklch(0.527 0.154 150.069);
}
```

## Key variables at a glance

| Variable | What it controls |
|---|---|
| `--background` | Main panel background |
| `--foreground` | Primary text colour |
| `--primary` | Action buttons, highlights, the dialler ring |
| `--destructive` | Hang-up button, error states |
| `--widget-background` | Floating toggle button background |
| `--widget-text` | Floating toggle button icon |
| `--border` | Dividers and outlines |
| `--radius` | Border-radius for all rounded elements |

## Customisation approaches

{% columns %}
{% column %}
### Build from source

Edit `src/assets/index.css` directly and rebuild:

```css
:host {
  --primary: oklch(0.6 0.2 260);  /* Blue */
  --widget-background: oklch(0.6 0.2 260);
}
```

Then run `pnpm build`.
{% endcolumn %}

{% column %}
### Runtime injection

Inject a `<style>` element into the shadow root after render. This requires the shadow root reference, which is not currently exposed via the public API — use the build-from-source approach for permanent changes.
{% endcolumn %}
{% endcolumns %}

## Theme switching

Switch between themes at runtime via the API:

```typescript
api.theme.set("dark")    // Force dark
api.theme.set("light")   // Force light
api.theme.set("system")  // Follow OS preference
```

Or configure the initial theme on render:

```typescript
await webphone.render({ theme: "dark" })
```
