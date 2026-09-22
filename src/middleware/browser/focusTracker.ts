/**
 * As duas checagens são necessárias: `visibilityState` pega janela minimizada e aba em
 * segundo plano; `hasFocus`, a aba da mesma janela que não mudou de visibilidade.
 */
export type FocusTracker = {
  isUnfocused: () => boolean;
};

export const documentFocusTracker: FocusTracker = {
  isUnfocused: () => {
    if (typeof document === "undefined") return false;
    return document.visibilityState === "hidden" || !document.hasFocus();
  },
};
