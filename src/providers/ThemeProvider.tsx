import { bus } from "@/lib/webphone-api/bus";
import { useBusState } from "@/lib/webphone-api/hooks/useBusState";
import type { Theme } from "@/providers/settings/settings";

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const theme = useBusState("theme.value", "theme.changed");
  return {
    theme,
    setTheme: (next) => {
      void bus.request("theme.set", { theme: next });
    },
  };
}
