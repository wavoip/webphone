import ReactDOM from "react-dom/client";
import styles from "./style.css?inline";
import { WebPhone } from "./WebPhone";

class WebPhoneElement extends HTMLElement {
  private root: ReactDOM.Root | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
  }

  attributeChangedCallback() {
    this.mount();
  }

  private mount() {
    if (!this.root) {
      const container = document.createElement("div");
      container.className = "wavoip"; // <== ensures Tailwind utilities apply

      this.appendChild(container);

      const styleTag = document.createElement("style");
      styleTag.textContent = styles;
      this.appendChild(styleTag);

      this.root = ReactDOM.createRoot(container);
    }

    this.root.render(<WebPhone />);
  }

  private unmount() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

customElements.define("webphone-widget", WebPhoneElement);
