import { type KeyboardEvent, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";

type Props = {
  value: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
};

const FEEDBACK_DURATION_MS = 1500;

export function CopyableText({ value, ariaLabel, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shadow = useContext(ShadowRootContext);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
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
        {/* biome-ignore lint/a11y/useSemanticElements: caller may pass block-level children, which would be invalid inside <button>. Span + role=button + keyboard handler preserves semantics. */}
        <span
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`wv:inline-flex wv:items-center wv:gap-1 wv:rounded wv:px-1 wv:-mx-1 wv:cursor-pointer wv:select-none wv:transition-colors wv:hover:bg-foreground/10 wv:active:bg-foreground/20 wv:active:scale-[0.98] ${className ?? ""}`}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent container={shadow?.root} side="top" sideOffset={4} className="wv:bg-green-600 wv:text-white">
        {t("Copied")}
      </TooltipContent>
    </Tooltip>
  );
}
