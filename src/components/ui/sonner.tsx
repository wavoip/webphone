import { Toaster as SolidToaster, type ToasterProps } from "solid-sonner";

import { useTheme } from "@/providers/ThemeProvider";

function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <SolidToaster
      theme={theme}
      class="wv:toaster wv:group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
}

export { Toaster };
