import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import MarqueeText from "@/components/MarqueeText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePip } from "@/providers/PipProvider";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type Props = {
  displayName: string | null | undefined;
  phone: string;
  /** Set when the call was placed by username rather than by number. */
  username?: string | null;
  className?: string;
  marqueeSpeed?: number;
};

const FEEDBACK_DURATION_MS = 1500;

/**
 * Renders the call peer (displayName preferred, phone as fallback) inside a
 * MarqueeText so long labels scroll on hover. Click copies the identity the call
 * was placed to — the username when there was one, the phone number otherwise —
 * and never the displayName. Copying what was dialled is what makes the copied
 * value redial. Pops a floating "Copiado" tooltip that escapes the
 * active call header's clipping ancestors.
 *
 * The trigger uses a `<span role="button">` instead of `<button>` because the
 * MarqueeText internals are block-level (`<div>`), and `<button><div></div>`
 * is invalid HTML.
 */
export function CopyablePeer({ displayName, phone, username, className, marqueeSpeed = 10 }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shadow = useShadowRoot();
  const pip = usePip();
  const tooltipContainer = pip.pipWindow?.document.body ?? shadow.root;
  const clipboard = pip.pipWindow?.navigator.clipboard ?? navigator.clipboard;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const label = displayName?.trim() || username?.trim() || phone;
  const copyValue = username?.trim() || phone;

  if (!copyValue) {
    return (
      <MarqueeText speed={marqueeSpeed} className={className}>
        {label}
      </MarqueeText>
    );
  }

  const handleClick = async () => {
    try {
      await clipboard.writeText(copyValue);
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
      <TooltipContent container={tooltipContainer} side="top" sideOffset={4} className="wv:bg-green-600 wv:text-white">
        Copiado
      </TooltipContent>
    </Tooltip>
  );
}
