/**
 * Single point of contact with `@wavoip/wavoip-api`.
 *
 * All UI code (components, hooks, providers) must import SDK types/values
 * from this module — never directly from `@wavoip/wavoip-api`. The ACL
 * layer is the only consumer permitted to depend on the SDK shape; this
 * re-export keeps the dependency surface narrow and makes future SDK
 * changes a single-file migration.
 */

import type { Device } from "@wavoip/wavoip-api";

export type {
  CallActive,
  CallOutgoing,
  CallPeer,
  Device,
  Offer,
  TransportStatus,
} from "@wavoip/wavoip-api";
export { Wavoip } from "@wavoip/wavoip-api";

export type DeviceState = Device & { enable: boolean; persist: boolean };
