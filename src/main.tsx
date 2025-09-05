import { createRoot } from "react-dom/client";
import "./index.css";
import { WebPhone } from "@/WebPhone";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <WebPhone />
//   </StrictMode>,
// );

createRoot(document.getElementById("root")!).render(<WebPhone />);
