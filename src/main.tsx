import { createRoot } from "react-dom/client";
import "./index.css";
import { WebPhone } from "@/WebPhone";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <WebPhone />
//   </StrictMode>,
// );

const root = document.getElementById("root")!;
root.style.height = "100vh";
root.style.width = "100vw";

createRoot(root).render(<WebPhone />);
