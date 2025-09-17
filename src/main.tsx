import { createRoot } from "react-dom/client";
import "./index.css";
import { WebPhone } from "@/WebPhone";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <WebPhone />
//   </StrictMode>,
// );

const webphoneRoot = document.getElementById("webphone")!;
webphoneRoot.style.height = "100vh";
webphoneRoot.style.width = "100vw";
const root = document.createElement("div");
root.id = "root";
webphoneRoot.appendChild(root);
createRoot(root).render(<WebPhone root={root} />);
