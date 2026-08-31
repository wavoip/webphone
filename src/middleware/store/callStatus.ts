import type { CallStatus } from "@/middleware/store/slices/callSlice";

/**
 * The statuses a call does not move on from. Lived duplicated in `resetCallTimer`
 * and `callLifecycleEvents`, which had to be edited in lockstep; a third copy was
 * about to appear in `CallController`. One definition, imported by all three.
 *
 * `CANCELLED` belongs here for the same reason as the rest: someone gave up before
 * the answer, and the call is over.
 */
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
