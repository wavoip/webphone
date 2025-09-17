import ReactDOM from "react-dom/client";
import { WebPhone } from "@/WebPhone";
import styles from "./style.css?inline";

class WebPhoneComponent {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;

  render() {
    if (this.root) return;

    this.container = document.createElement("div");
    this.container.id = "webphone";
    const shadow = this.container.attachShadow({ mode: "open" });
    document.body.appendChild(this.container);

    // Inject Tailwind CSS
    const styleTag = document.createElement("style");
    styleTag.textContent = styles;
    shadow.appendChild(styleTag);

    // Create React root container inside shadow first
    const containerRoot = document.createElement("div");
    containerRoot.id = "root";
    shadow.appendChild(containerRoot);

    // Then render React
    this.root = ReactDOM.createRoot(containerRoot);
    this.root.render(<WebPhone root={containerRoot} />);
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

export { webphone };
