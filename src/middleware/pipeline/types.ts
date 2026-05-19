import type { Offer } from "@wavoip/wavoip-api";

export type MiddlewareEventMap = {
  offer: Offer;
};

export type MiddlewareEvent = keyof MiddlewareEventMap;

export type NextFn = () => void;

export type Middleware<T> = (payload: T, next: NextFn) => void | Promise<void>;
