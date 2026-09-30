/** Compara um nível: é o que basta para um seletor que devolve um objeto de campos. */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;

  const keysA = Object.keys(a as object);
  if (keysA.length !== Object.keys(b as object).length) return false;

  return keysA.every(
    (key) =>
      Object.hasOwn(b as object, key) &&
      Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}
