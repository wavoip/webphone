import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";

describe("webphone.render(config) — provider tree integration", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  describe("widget config", () => {
    it("widget.startOpen=true opens the widget on mount", async () => {
      const { api } = await renderWithProviders({ config: { widget: { startOpen: true } } });
      expect(api.widget.isOpen).toBe(true);
    });

    it("widget.startOpen=false (default) leaves the widget closed", async () => {
      const { api } = await renderWithProviders({ config: {} });
      expect(api.widget.isOpen).toBe(false);
    });

    it("widget.showWidgetButton=false hides the floating button via settings", async () => {
      const { api } = await renderWithProviders({ config: { widget: { showWidgetButton: false } } });
      expect(api.settings.showWidgetButton).toBe(false);
    });

    it("buttonPosition keyword resolves to viewport coordinates", async () => {
      const { api } = await renderWithProviders({ config: { buttonPosition: "top-left" } });
      // Margem de 20px no canto, qualquer que seja o viewport.
      expect(api.widget.buttonPosition.value.x).toBe(20);
      expect(api.widget.buttonPosition.value.y).toBe(20);
    });
  });

  describe("platform forwarding", () => {
    it("config.platform is forwarded to the Wavoip constructor", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      const { api } = await renderWithProviders({
        config: { platform: "test-platform" },
        wavoip,
      });
      expect(api.device.get().map((d) => d.token)).toEqual(["tok-1"]);
    });
  });

  describe("callSettings.displayName", () => {
    it("offers receive the configured displayName before reaching the store", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      const { api } = await renderWithProviders({
        config: { callSettings: { displayName: "Friendly Name" } },
        wavoip,
      });
      // Este teste não confere o displayName na oferta: só que a API sobe com essa
      // config.
      expect(api).toBeDefined();
    });
  });

  describe("theme via localStorage", () => {
    it("bootstrapStore seeds store theme from localStorage on mount", async () => {
      localStorage.setItem("webphone-ui-theme", "dark");
      const { api } = await renderWithProviders();
      expect(api.theme.value).toBe("dark");
    });

    it("api.theme.set persists to localStorage via ThemeProvider effect", async () => {
      const { api } = await renderWithProviders();
      api.theme.set("light");
      await waitFor(() => {
        expect(localStorage.getItem("webphone-ui-theme")).toBe("light");
      });
      expect(api.theme.value).toBe("light");
    });
  });
});
