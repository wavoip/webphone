import { createComputed, createMemo, createRoot, on, untrack } from "solid-js";
import { createStore } from "solid-js/store";
import { createCallSlice } from "@/middleware/store/slices/callSlice";
import { createDeviceSlice } from "@/middleware/store/slices/deviceSlice";
import { createNotificationsSlice } from "@/middleware/store/slices/notificationsSlice";
import { createUiSlice } from "@/middleware/store/slices/uiSlice";
import { createWidgetSlice } from "@/middleware/store/slices/widgetSlice";
import type { MiddlewareStore } from "@/middleware/store/types";

/** O que uma slice recebe para escrever: um objeto parcial, ou como função do estado. */
export type SliceSet = (
  partial: Partial<MiddlewareStore> | ((state: MiddlewareStore) => Partial<MiddlewareStore>),
) => void;

export type SliceCreator<T> = (set: SliceSet, get: () => MiddlewareStore) => T;

export type SubscribeOptions<T> = { equalityFn?: (a: T, b: T) => boolean };

export type MiddlewareStoreApi = {
  /**
   * O estado. Ler um campo dentro de um escopo reativo rastreia aquele campo; fora, é
   * leitura comum. É o mesmo objeto que a UI e a API pública enxergam.
   */
  getState: () => MiddlewareStore;
  setState: SliceSet;
  /** Chama `listener` quando o que o seletor devolve muda. Devolve o cancelamento. */
  subscribe: <T>(
    selector: (state: MiddlewareStore) => T,
    listener: (value: T, previous: T) => void,
    options?: SubscribeOptions<T>,
  ) => () => void;
  destroy: () => void;
};

export function createMiddlewareStore(): MiddlewareStoreApi {
  let state!: MiddlewareStore;
  let write!: (partial: Partial<MiddlewareStore>) => void;

  // As slices só chamam `set`/`get` dentro das ações, então fechar sobre variáveis que
  // ainda não foram atribuídas é seguro — e é o que desfaz o ovo-e-galinha de precisar
  // do store para criar o estado inicial que o próprio store recebe.
  const set: SliceSet = (partial) => {
    write(typeof partial === "function" ? partial(state) : partial);
  };
  const get = () => state;

  const disposeStore = createRoot((dispose) => {
    const [store, setStore] = createStore<MiddlewareStore>({
      ...createCallSlice(set, get),
      ...createDeviceSlice(set, get),
      ...createNotificationsSlice(set, get),
      ...createWidgetSlice(set, get),
      ...createUiSlice(set, get),
    } as MiddlewareStore);
    state = store;
    write = setStore;
    return dispose;
  });

  function subscribe<T>(
    selector: (state: MiddlewareStore) => T,
    listener: (value: T, previous: T) => void,
    options?: SubscribeOptions<T>,
  ): () => void {
    return createRoot((dispose) => {
      const value = createMemo(() => selector(state), undefined, { equals: options?.equalityFn });
      // O anterior começa valendo o de agora, e não `undefined`: quem observa compara
      // contra o estado de quando assinou — é assim que `ringtoneEffect` distingue a
      // primeira oferta de mais uma oferta.
      let previous = untrack(value);
      // `createComputed` roda na mesma passada da escrita, e não depois: quem observa o
      // store vê a mudança no mesmo tick.
      createComputed(
        on(
          value,
          (current) => {
            const anterior = previous;
            previous = current;
            untrack(() => listener(current, anterior));
          },
          { defer: true },
        ),
      );
      return dispose;
    });
  }

  return { getState: get, setState: set, subscribe, destroy: disposeStore };
}
