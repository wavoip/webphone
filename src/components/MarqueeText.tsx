import { createSignal, type JSX, onCleanup, onMount, Show } from "solid-js";

type Props = {
  children: JSX.Element;
  speed?: number;
  class?: string;
};

/** Só rola quando o texto não cabe; medir é o que decide, e o tamanho muda com a janela. */
export default function MarqueeText(props: Props) {
  const [shouldAnimate, setShouldAnimate] = createSignal(false);
  let container: HTMLDivElement | undefined;
  let text: HTMLSpanElement | undefined;

  onMount(() => {
    if (!text) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setShouldAnimate(entry.contentRect.width > (container?.offsetWidth ?? 0));
      }
    });
    observer.observe(text);
    onCleanup(() => observer.disconnect());
  });

  return (
    <div class="marquee-container" ref={container}>
      <div
        class={`marquee-track ${shouldAnimate() ? "marquee-animate" : ""}`}
        style={{ "animation-duration": `${props.speed ?? 15}s` }}
      >
        <span ref={text} class={props.class ?? ""}>
          {props.children}
        </span>
        <Show when={shouldAnimate()}>
          <span class={props.class ?? ""}>{props.children}</span>
        </Show>
      </div>
    </div>
  );
}
