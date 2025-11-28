import ReactDOM from "react-dom/client";
import { App } from "@/App";
import styles from "@/assets/index.css?inline";

class WebPhoneComponent {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;

  render() {
    if (this.root) return;

    this.container = document.createElement("div");
    this.container.id = "webphone";
    document.body.appendChild(this.container);

    const shadowRoot = this.container.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = styles;
    shadowRoot.appendChild(style);

    const shadowContainer = document.createElement("div");
    shadowContainer.id = "root";
    shadowRoot.appendChild(shadowContainer);

    this.root = ReactDOM.createRoot(shadowContainer);
    this.root.render(<App shadowRoot={shadowRoot} />);
  }

  destroy() {
    if (!this.root || !this.container) {
      return;
    }

    this.root.unmount();
    this.container.remove();

    this.root = null;
    this.container = null;
  }
}

const webphone = new WebPhoneComponent();

export default webphone;
