import { DelegatedEvents } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { delegateEventsToRoot } from "@/lib/event-delegation";

/**
 * O efeito de verdade — clique dentro de shadow root chegar no `onClick` — não dá para
 * checar aqui: o happy-dom não retargeta `event.target` na borda do shadow root, então
 * o bug não acontece no teste e a correção parece um clique duplicado. Sobra a garantia
 * de que a raiz recebe a lista inteira do Solid, que foi o que faltava.
 */
class SpyRoot {
  readonly registered: string[] = [];

  addEventListener(name: string): void {
    this.registered.push(name);
  }
}

describe("delegateEventsToRoot", () => {
  it("registers every event Solid delegates on the given root", () => {
    const root = new SpyRoot();

    delegateEventsToRoot(root as unknown as Document);

    expect(root.registered).toEqual([...DelegatedEvents]);
  });
});
