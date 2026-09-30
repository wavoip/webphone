/**
 * A fronteira de teste da interface. O `@solidjs/testing-library` reexporta tudo do
 * `@testing-library/dom`, então só o `act` é nosso.
 */
export * from "@solidjs/testing-library";

/**
 * O Solid não tem lote de render para fechar — a escrita propaga na hora. O que sobra do
 * `act` do React é esperar o que a ação agendou, e é só isso que este faz.
 */
export async function act<T>(fn: () => T | Promise<T>): Promise<T> {
  const resultado = await fn();
  await Promise.resolve();
  return resultado;
}
