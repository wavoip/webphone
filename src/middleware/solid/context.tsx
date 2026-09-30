import { createContext, type JSX, useContext } from "solid-js";
import type { Middleware } from "@/middleware/Middleware";
import type { MiddlewareStore } from "@/middleware/store/types";

const MiddlewareContext = createContext<Middleware>();

export function MiddlewareProvider(props: { middleware: Middleware; children: JSX.Element }) {
  return <MiddlewareContext.Provider value={props.middleware}>{props.children}</MiddlewareContext.Provider>;
}

export function useMiddleware(): Middleware {
  const middleware = useContext(MiddlewareContext);
  if (!middleware) throw new Error("useMiddleware must be used inside MiddlewareProvider");
  return middleware;
}

/**
 * O estado, como um objeto só. Ler um campo dentro do JSX assina aquele campo: mudar
 * `keyboardInput` não acorda quem lê `callStatus`.
 *
 * Os sete seletores que existiam aqui eram do React, que assinava por componente e
 * precisava saber qual fatia tinha mudado. Não há o que agrupar quando a assinatura é
 * por campo.
 */
export function useStore(): MiddlewareStore {
  return useMiddleware().store.getState();
}
