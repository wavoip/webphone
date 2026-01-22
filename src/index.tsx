import ReactDOM from "react-dom/client";
import sonnerStyles from "sonner/dist/styles.css?inline";
import { App } from "@/App";
import styles from "@/assets/index.css?inline";
import { webphoneAPIPromise } from "@/lib/webphone-api/api";
import type { WebphoneSettings } from "@/providers/settings/settings";
import type { WebphoneAPI } from "./lib/webphone-api/WebphoneAPI";

class WebPhoneComponent {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;

  async render(config?: WebphoneSettings) {
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

    const root = document.createElement("div");
    root.id = "root";
    shadowRoot.appendChild(root);

    const container = document.createElement("div");
    container.id = "container";
    root.appendChild(container);

    this.root = ReactDOM.createRoot(container);
    this.root.render(<App shadowRoot={shadowRoot} root={root} config={config || {}} />);

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
