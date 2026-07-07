import { type KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import MarqueeText from "@/components/MarqueeText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PipContext } from "@/providers/PipProvider";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";

type Props = {
  displayName: string | null | undefined;
  phone: string;
  className?: string;
  marqueeSpeed?: number;
};

const FEEDBACK_DURATION_MS = 1500;

/**
 * Renders the call peer (displayName preferred, phone as fallback) inside a
 * MarqueeText so long labels scroll on hover. Click copies the *phone number*
 * — never the displayName — to the clipboard and pops a floating "Copiado"
 * tooltip that escapes the active call header's clipping ancestors.
 *
 * The trigger uses a `<span role="button">` instead of `<button>` because the
 * MarqueeText internals are block-level (`<div>`), and `<button><div></div>`
 * is invalid HTML.
 */
export function CopyablePeer({ displayName, phone, className, marqueeSpeed = 10 }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read via raw context (no throwing helper) so unit tests can render
  // CopyablePeer outside the App tree and still get a working tooltip
  // (falls back to document.body when there is no ShadowRoot).
  const shadow = useContext(ShadowRootContext);
  // CallScreen only ever mounts in one place at a time (normal widget XOR
  // inside the PiP window), so pipWindow here reliably means "this instance
  // is the one inside the PiP" — portal the tooltip into its own document,
  // not the (hidden) main document's shadow root.
  const pip = useContext(PipContext);
  const tooltipContainer = pip?.pipWindow?.document.body ?? shadow?.root;
  // navigator.clipboard checks focus on the document that calls it. Inside
  // the PiP window that's pipWindow's document, not the (unfocused) main
  // one — write through pipWindow's own navigator or every copy throws
  // "Document is not focused".
  const clipboard = pip?.pipWindow?.navigator.clipboard ?? navigator.clipboard;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const label = displayName?.trim() || phone;

  if (!phone) {
    return (
      <MarqueeText speed={marqueeSpeed} className={className}>
        {label}
      </MarqueeText>
    );
  }

  const handleClick = async () => {
    try {
      await clipboard.writeText(phone);
    } catch (e) {
      console.error(e);
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), FEEDBACK_DURATION_MS);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    void handleClick();
  };

  return (
    <Tooltip open={copied}>
      <TooltipTrigger asChild>
        {/* biome-ignore lint/a11y/useSemanticElements: MarqueeText renders block-level <div>, which is invalid inside <button>. Span + role=button + keyboard handler preserves semantics. */}
        <span
          role="button"
          tabIndex={0}
          aria-label="Copiar telefone"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="wv:cursor-pointer wv:select-none wv:block wv:w-full"
        >
          <MarqueeText speed={marqueeSpeed} className={className}>
            {label}
          </MarqueeText>
        </span>
      </TooltipTrigger>
      <TooltipContent
        container={tooltipContainer}
        side="top"
        sideOffset={4}
        className="wv:bg-green-600 wv:text-white"
      >
        Copiado
      </TooltipContent>
    </Tooltip>
  );
}
