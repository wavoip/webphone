/**
 * Reports whether the page is currently out of focus. `visibilityState` covers
 * minimized windows and background tabs; `hasFocus` covers same-window tabs
 * that did not change visibility. Both checks are needed for full coverage.
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
