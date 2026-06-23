import { type TranslationKey, t } from "@/lib/i18n";

/**
 * Known SDK reason codes mirror `Helper.mapError` server-side. `AUDIO_TIMEOUT`
 * is the deprecated alias for `PEER_RX_TIMEOUT` — both resolve to the same
 * translated label.
 */
const KNOWN_REASONS: Record<string, TranslationKey> = {
  PEER_TX_TIMEOUT: "PEER_TX_TIMEOUT",
  PEER_RX_TIMEOUT: "PEER_RX_TIMEOUT",
  AUDIO_TIMEOUT: "PEER_RX_TIMEOUT",
  CORRUPTED_KEYS: "CORRUPTED_KEYS",
  CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT",
  ACCOUNT_RESTRICTED: "ACCOUNT_RESTRICTED",
  NO_CALL_PERMISSION: "NO_CALL_PERMISSION",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

export const translateCallFailReason = (reason: string): string => {
  const key = KNOWN_REASONS[reason];
  return key ? t(key) : reason;
};
