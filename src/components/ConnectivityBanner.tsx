import type { ConnectivityIssue } from "@wavoip/wavoip-api/web";
import { Show } from "solid-js";
import { X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { type TranslationKey, t } from "@/lib/i18n";

type Props = {
  issue: ConnectivityIssue | null;
  onDismiss: () => void;
  onOpenDebug: () => void;
};

const issueMessages: Record<ConnectivityIssue, TranslationKey> = {
  STUN_UNREACHABLE: "STUN unreachable",
  ICE_GATHERING_TIMEOUT: "ICE gathering timed out",
  ICE_CONNECTION_FAILED: "Connection failed",
  NO_HOST_CANDIDATES: "No host candidates",
  SYMMETRIC_NAT_SUSPECTED: "Symmetric NAT suspected",
};

export function ConnectivityBanner(props: Props) {
  return (
    <Show when={props.issue}>
      {(issue) => (
        <div
          role="alert"
          class="wv:flex wv:items-center wv:gap-2 wv:bg-amber-100 wv:text-amber-900 wv:px-3 wv:py-2 wv:rounded-md"
        >
          <span class="wv:flex-1 wv:text-sm">{t(issueMessages[issue()])}</span>
          <Button type="button" variant="ghost" size="sm" onClick={props.onOpenDebug}>
            {t("Open diagnostics")}
          </Button>
          <button type="button" aria-label={t("Close")} onClick={props.onDismiss} class="wv:p-1">
            <X class="wv:size-4" />
          </button>
        </div>
      )}
    </Show>
  );
}
