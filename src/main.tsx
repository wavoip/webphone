import { createRoot } from "react-dom/client";
import "@/assets/index.css";
import { App } from "@/App";

const webphoneRoot = document.getElementById("webphone")!;
webphoneRoot.style.height = "100vh";
webphoneRoot.style.width = "100vw";

const root = document.createElement("div");
root.id = "root";
webphoneRoot.appendChild(root);

createRoot(root).render(<App root={root} />);

console.log(window.wavoip);
window.wavoip?.widget.open();
