import type {
  EventPayload,
  EventType,
  QueryResult,
  QueryType,
  RequestPayload,
  RequestResult,
  RequestType,
} from "@/lib/webphone-api/events";

type EventListener<T extends EventType> = (payload: EventPayload<T>) => void;
type RequestHandler<T extends RequestType> = (payload: RequestPayload<T>) => Promise<RequestResult<T>>;
type QueryGetter<T extends QueryType> = () => QueryResult<T>;

type ErasedListener = (payload: unknown) => void;
type ErasedRequestHandler = (payload: unknown) => Promise<unknown>;
type ErasedQueryGetter = () => unknown;

const listeners = new Map<EventType, Set<ErasedListener>>();
const requestHandlers = new Map<RequestType, ErasedRequestHandler>();
const queryGetters = new Map<QueryType, ErasedQueryGetter>();

function emit<T extends EventType>(type: T, payload: EventPayload<T>): void {
  const set = listeners.get(type);
  if (!set) return;
  for (const cb of set) cb(payload);
}

function on<T extends EventType>(type: T, cb: EventListener<T>): () => void {
  let set = listeners.get(type);
  if (!set) {
    set = new Set<ErasedListener>();
    listeners.set(type, set);
  }
  const erased = cb as ErasedListener;
  set.add(erased);
  return () => {
    set.delete(erased);
    if (set.size === 0) listeners.delete(type);
  };
}

function handle<T extends RequestType>(type: T, handler: RequestHandler<T>): () => void {
  if (requestHandlers.has(type)) {
    throw new Error(
      `bus.handle: handler already registered for "${type}". Expected a single handler per request type.`,
    );
  }
  requestHandlers.set(type, handler as ErasedRequestHandler);
  return () => {
    requestHandlers.delete(type);
  };
}

async function request<T extends RequestType>(type: T, payload: RequestPayload<T>): Promise<RequestResult<T>> {
  const handler = requestHandlers.get(type) as RequestHandler<T> | undefined;
  if (!handler) {
    throw new Error(
      `bus.request: no handler registered for "${type}". Expected handler returning Promise<RequestResult<"${type}">>.`,
    );
  }
  return handler(payload);
}

function registerQuery<T extends QueryType>(type: T, getter: QueryGetter<T>): () => void {
  if (queryGetters.has(type)) {
    throw new Error(
      `bus.registerQuery: getter already registered for "${type}". Expected a single getter per query type.`,
    );
  }
  queryGetters.set(type, getter as ErasedQueryGetter);
  return () => {
    queryGetters.delete(type);
  };
}

function query<T extends QueryType>(type: T): QueryResult<T> {
  const getter = queryGetters.get(type) as QueryGetter<T> | undefined;
  if (!getter) {
    throw new Error(`bus.query: no getter registered for "${type}". Expected getter returning QueryResult<"${type}">.`);
  }
  return getter();
}

function reset(): void {
  listeners.clear();
  requestHandlers.clear();
  queryGetters.clear();
}

export const bus = {
  emit,
  on,
  handle,
  request,
  registerQuery,
  query,
  reset,
};
