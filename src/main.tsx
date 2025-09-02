import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WebPhone } from "./WebPhone.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<WebPhone />
	</StrictMode>,
);
