import { createRoot } from "react-dom/client";
import sonnerStyles from "sonner/dist/styles.css?inline";
import { App } from "@/App";
import styles from "@/assets/index.css?inline";

const webphoneRoot = document.getElementById("webphone")!;

const shadowRoot = webphoneRoot.attachShadow({ mode: "closed" });

const style = document.createElement("style");
style.textContent = `
${styles} 
${sonnerStyles.replace(/(\[data-sonner-[^\]]+\])/g, `:host $1`)}
`;
shadowRoot.appendChild(style);

const shadowContainer = document.createElement("div");
shadowContainer.id = "root";
shadowRoot.appendChild(shadowContainer);

createRoot(shadowContainer).render(<App shadowRoot={shadowRoot} />);
