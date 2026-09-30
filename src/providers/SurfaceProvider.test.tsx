import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { render } from "@/middleware/testing/dom";
import { type Surface, SurfaceProvider, useSurface } from "@/providers/SurfaceProvider";

/** A janela que o `documentPictureInPicture.requestWindow` devolveria. */
class FakePipWindow {
  readonly window = new Window();

  asWindow(): Window & typeof globalThis.window {
    return this.window as unknown as Window & typeof globalThis.window;
  }
}

function stubPictureInPicture(pip: FakePipWindow): void {
  Object.defineProperty(window, "documentPictureInPicture", {
    value: { requestWindow: vi.fn().mockResolvedValue(pip.asWindow()) },
    configurable: true,
  });
}

function mountSurface(): { surface: Surface; root: HTMLDivElement; dispose: () => void } {
  const root = document.createElement("div");
  const shadowRoot = document.createElement("div").attachShadow({ mode: "open" });
  let surface!: Surface;

  const Probe = () => {
    surface = useSurface();
    return null;
  };

  const { unmount } = render(() => (
    <SurfaceProvider layout="floating" root={root} rootNode={shadowRoot}>
      <Probe />
    </SurfaceProvider>
  ));

  return { surface, root, dispose: unmount };
}

describe("SurfaceProvider", () => {
  it("points the container at the page while there is no Picture-in-Picture", () => {
    const { surface, root, dispose } = mountSurface();

    expect(surface.container()).toBe(root);
    expect(surface.isPiP()).toBe(false);

    dispose();
  });

  it("moves the container into the Picture-in-Picture frame once it is open", async () => {
    const pip = new FakePipWindow();
    stubPictureInPicture(pip);
    const { surface, dispose } = mountSurface();

    await surface.openPip();
    const quadro = document.createElement("div");
    surface.setPipContainer(quadro);

    expect(surface.isPiP()).toBe(true);
    expect(surface.container()).toBe(quadro);
    expect(surface.window()).toBe(pip.asWindow());
    expect(surface.rootNode()).toBe(pip.asWindow().document);

    dispose();
  });

  it("keeps the page as the container when a frame is left over without its window", () => {
    const { surface, root, dispose } = mountSurface();

    surface.setPipContainer(document.createElement("div"));

    expect(surface.container()).toBe(root);

    dispose();
  });
});
