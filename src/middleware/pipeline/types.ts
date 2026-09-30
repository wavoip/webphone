import type { IncomingCall } from "@wavoip/wavoip-api/web";

export type MiddlewareEventMap = {
  offer: IncomingCall;
};

export type MiddlewareEvent = keyof MiddlewareEventMap;

export type NextFn = () => void;

export type Middleware<T> = (payload: T, next: NextFn) => void | Promise<void>;
