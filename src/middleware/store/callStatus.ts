import type { CallStatus } from "@/middleware/store/slices/callSlice";

/** `CANCELLED` entra pelo mesmo motivo dos outros: alguém desistiu, e a chamada acabou. */
export const TERMINAL_CALL_STATUSES: ReadonlySet<CallStatus> = new Set([
  "ENDED",
  "CANCELLED",
  "FAILED",
  "REJECTED",
  "NOT_ANSWERED",
]);

export function isTerminalCallStatus(status: CallStatus): boolean {
  return TERMINAL_CALL_STATUSES.has(status);
}
