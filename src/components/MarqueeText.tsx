import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
};

export default function MarqueeText({ children, speed = 15, className }: Props) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<null | HTMLDivElement>(null);
  const textRef = useRef<null | HTMLSpanElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!containerRef || !textRef) {
      return;
    }
    const containerWidth = containerRef?.current?.offsetWidth || 0;

    setShouldAnimate(width > containerWidth);
  }, [width]);

  useEffect(() => {
    if (!textRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(textRef?.current);

    // cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <div className="marquee-container" ref={containerRef}>
      <div
        className={`marquee-track ${shouldAnimate ? "marquee-animate" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <span ref={textRef} className={className ?? ""}>
          {children}
        </span>
        {shouldAnimate && <span className={className ?? ""}>{children}</span>}
      </div>
    </div>
  );
}
