import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ShadowProvider } from "@/providers/ShadowRootProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  config: WebphoneSettings;
};

export function App({ shadowRoot, root, config }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()], platform: config.platform }));

  // FUNÇÃO DE TRANSPORTE (PiP)
  const handleOpenPiP = async () => {
    if (!('documentPictureInPicture' in window)) {
      alert("Seu navegador não suporta janelas flutuantes nativas. Use Edge ou Chrome.");
      return;
    }

    try {

      //copia o local org do PIP 
      const originalParent = root.parentNode;

      // 1. Abre a janela nativa
      // @ts-ignore
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 550,
      });

      // 2. Copia o "DNA" visual (Classes e Cores)
      pipWindow.document.documentElement.className = document.documentElement.className;
      pipWindow.document.body.className = document.body.className;
      pipWindow.document.body.style.backgroundColor = "#1a1b1e"; // Cor do fundo do seu print
      pipWindow.document.body.style.overflow = "hidden";

      // 3. Copia o CSS Global
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
          const style = document.createElement("style");
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement("link");
          link.rel = 'stylesheet';
          link.href = (styleSheet as any).href;
          pipWindow.document.head.appendChild(link);
        }
      });

      // 4. Copia o CSS de dentro do Shadow DOM (vital para o seu projeto)
      shadowRoot.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
        pipWindow.document.head.appendChild(el.cloneNode(true));
      });

      // 5. Move o Webphone inteiro para a nova janela
      pipWindow.document.body.append(root);

      // 6. Ao fechar, devolve para a aba original
      pipWindow.addEventListener("pagehide", () => {
        if (originalParent) {
          originalParent.appendChild(root);

        } else {
          document.body.append(root);
        }
      });

    } catch (err) {
      console.error("Erro no PiP:", err);
    }



  };




  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <ThemeProvider root={root} defaultTheme={config.theme} storageKey="webphone-ui-theme">
          <WidgetProvider>
            <NotificationsProvider>
              <ScreenProvider>
                <WavoipProvider wavoip={wavoip}>
                  {/* Enviamos a função */}
                  <WebPhone onPipClick={handleOpenPiP} />
                </WavoipProvider>
              </ScreenProvider>
            </NotificationsProvider>
          </WidgetProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ShadowProvider>
  );
}