import ReactDOM from "react-dom/client";
import sonnerStyles from "sonner/dist/styles.css?inline";
import { App } from "@/App";
import styles from "@/assets/index.css?inline";
import { type WebphoneAPI, webphoneAPIPromise } from "@/lib/webphone-api";
import type { AppConfig } from "@/providers/SettingsProvider";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type WebphoneConfig = DeepPartial<AppConfig>;

class WebPhoneComponent {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;

  async render(config?: WebphoneConfig) {
    if (this.root) return window.wavoip as WebphoneAPI;

    this.container = document.createElement("div");
    this.container.id = "webphone";
    document.body.appendChild(this.container);

    const shadowRoot = this.container.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
    ${styles} 
    ${sonnerStyles.replace(/(\[data-sonner-[^\]]+\])/g, `:host $1`)}
    `;
    shadowRoot.appendChild(style);

    const shadowContainer = document.createElement("div");
    shadowContainer.id = "root";
    shadowRoot.appendChild(shadowContainer);

    this.root = ReactDOM.createRoot(shadowContainer);
    this.root.render(<App shadowRoot={shadowRoot} config={config || {}} />);

    const webphoneAPI = await webphoneAPIPromise;
    window.wavoip = webphoneAPI;
    return webphoneAPI;
  }

  destroy() {
    if (!this.root || !this.container) {
      return;
    }

    this.root.unmount();
    this.container.remove();

    this.root = null;
    this.container = null;

    window.wavoip = undefined;
  }
}

const webphone = new WebPhoneComponent();
export default webphone;
