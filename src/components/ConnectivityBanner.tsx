import type { ConnectivityIssue } from "@wavoip/wavoip-api";
import { XIcon } from "lucide-react";
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

export function ConnectivityBanner({ issue, onDismiss, onOpenDebug }: Props) {
  if (!issue) return null;
  const messageKey = issueMessages[issue];

  return (
    <div
      role="alert"
      className="wv:flex wv:items-center wv:gap-2 wv:bg-amber-100 wv:text-amber-900 wv:px-3 wv:py-2 wv:rounded-md"
    >
      <span className="wv:flex-1 wv:text-sm">{t(messageKey)}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onOpenDebug}>
        {t("Open diagnostics")}
      </Button>
      <button type="button" aria-label={t("Close")} onClick={onDismiss} className="wv:p-1">
        <XIcon className="wv:size-4" />
      </button>
    </div>
  );
}
