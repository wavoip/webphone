import { type TranslationKey, t } from "@/lib/i18n";

/**
 * Map known call failure reasons emitted by `@wavoip/wavoip-api` (server-side
 * codes from `Helper.mapError`) to translation keys. `AUDIO_TIMEOUT` is the
 * deprecated alias for `PEER_RX_TIMEOUT` and shares the same label.
 *
 * Unknown reasons fall through to the raw string so future server-side codes
 * remain visible to the user without forcing a webphone bump.
 */
const REASON_KEYS: Record<string, TranslationKey> = {
  AUDIO_TIMEOUT: "User audio timeout",
  PEER_RX_TIMEOUT: "User audio timeout",
  PEER_TX_TIMEOUT: "Peer audio timeout",
  CORRUPTED_KEYS: "Corrupted keys",
  CONNECTION_TIMEOUT: "Connection timeout",
  ACCOUNT_RESTRICTED: "Account restricted",
  NO_CALL_PERMISSION: "No call permission",
  INTERNAL_ERROR: "Internal error",
};

export const translateCallFailReason = (reason: string): string => {
  const key = REASON_KEYS[reason];
  return key ? t(key) : reason;
};
