import type { Wavoip } from "@wavoip/wavoip-api/web";
import { render } from "solid-js/web";
import sonnerStyles from "solid-sonner/styles.css?inline";
import { App } from "@/App";
import styles from "@/assets/index.css?inline";
import { maybeUpgrade } from "@/lib/auto-update";
import { delegateEventsToRoot } from "@/lib/event-delegation";
import { webphoneAPIPromise } from "@/lib/webphone-api/api";
import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";
import type { WebphoneSettings } from "@/providers/settings/settings";

class WebPhoneComponent {
  private container: HTMLElement | null = null;
  private dispose: (() => void) | null = null;

  async render(config?: WebphoneSettings, wavoip?: Wavoip): Promise<WebphoneAPI | undefined> {
    if (this.dispose) return window.wavoip as WebphoneAPI;

    try {
      const upgraded = await maybeUpgrade(__WEBPHONE_VERSION__);
      if (upgraded) {
        this.destroy();
        return window.wavoipWebphone?.render(config, wavoip);
      }
    } catch (err) {
      console.warn(
        `[wavoip-webphone] auto-update failed at ${__WEBPHONE_VERSION__}; continuing with the current bundle`,
        err,
      );
    }

    this.container = document.createElement("div");
    this.container.id = "webphone";
    document.body.appendChild(this.container);

    const shadowRoot = this.container.attachShadow({ mode: "closed" });
    delegateEventsToRoot(shadowRoot);

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

    this.dispose = render(
      () => <App layout="floating" root={root} rootNode={shadowRoot} config={config || {}} wavoip={wavoip} />,
      container,
    );

    const webphoneAPI = await webphoneAPIPromise();
    window.wavoip = webphoneAPI;
    return webphoneAPI;
  }

  destroy() {
    if (!this.dispose || !this.container) {
      return;
    }

    this.dispose();
    this.container.remove();

    this.dispose = null;
    this.container = null;

    window.wavoip = undefined;
  }
}

const webphone = new WebPhoneComponent();
export default webphone;
