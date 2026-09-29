import { Wavoip, webRuntime } from "@wavoip/wavoip-api/web";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import "@/assets/index.css";
import "./app.css";
import "sonner/dist/styles.css";
import type { WebphoneSettings } from "@/providers/settings/settings";

/**
 * O PWA é dono da página, então nada aqui isola do hospedeiro: sem shadow root, sem
 * z-index de teto e sem auto-atualização — quem versiona é o service worker. O
 * `styleSource` é o `document.head` porque as folhas são nossas e da mesma origem.
 */
const APP_SETTINGS: WebphoneSettings = {
  widget: { showWidgetButton: false, startOpen: true },
};

function mount(): void {
  const host = document.getElementById("webphone-root");
  if (!host) throw new Error('missing #webphone-root in index.html; got null for getElementById("webphone-root")');

  const root = document.createElement("div");
  root.id = "root";
  host.appendChild(root);

  const container = document.createElement("div");
  container.id = "container";
  root.appendChild(container);

  ReactDOM.createRoot(container).render(
    <App
      layout="filled"
      root={root}
      rootNode={document}
      config={APP_SETTINGS}
      wavoip={new Wavoip({ tokens: [], platform: "pwa", runtime: webRuntime() })}
    />,
  );
}

mount();
