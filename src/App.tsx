import { Wavoip } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { documentPiPCallbacks } from "@/lib/picture-in-picture";
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

async function handleOpenPiP(root: HTMLDivElement, shadowRoot: ShadowRoot) {
  if (!("documentPictureInPicture" in window)) {
    alert("Seu navegador não suporta janelas flutuantes nativas. Use Edge ou Chrome.");
    return;
  }

  try {
    const originalParent = root.parentNode;

    // @ts-expect-error
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 320,
      height: 550,
    });

    pipWindow.document.documentElement.className = document.documentElement.className;
    pipWindow.document.body.className = document.body.className;
    pipWindow.document.body.style.backgroundColor = "#1a1b1e";
    pipWindow.document.body.style.overflow = "hidden";

    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
        const style = document.createElement("style");
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = (styleSheet as any).href;
        pipWindow.document.head.appendChild(link);
      }
    });

    shadowRoot.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      pipWindow.document.head.appendChild(el.cloneNode(true));
    });

    pipWindow.document.body.append(root);

    pipWindow.addEventListener("pagehide", () => {
      if (originalParent) {
        originalParent.appendChild(root);
      } else {
        document.body.append(root);
      }
    });

  } catch {
    // requestWindow falhou (sem suporte ou gesto do usuário inválido)
  }
}

export function App({ shadowRoot, root, config }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()], platform: config.platform }));

  const togglePiP = () => {
    // @ts-expect-error
    if (window.documentPictureInPicture?.window) {
      // @ts-expect-error
      window.documentPictureInPicture.window.close();
    } else {
      handleOpenPiP(root, shadowRoot);
    }
  };

  useEffect(() => {
    documentPiPCallbacks.open = () => handleOpenPiP(root, shadowRoot);
    return () => { documentPiPCallbacks.open = null; };
  }, [root, shadowRoot]);

  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <ThemeProvider root={root} defaultTheme={config.theme} storageKey="webphone-ui-theme">
          <WidgetProvider>
            <NotificationsProvider>
              <ScreenProvider>
                <WavoipProvider wavoip={wavoip}>
                  <WebPhone onTogglePip={togglePiP} />
                </WavoipProvider>
              </ScreenProvider>
            </NotificationsProvider>
          </WidgetProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ShadowProvider>
  );
}
