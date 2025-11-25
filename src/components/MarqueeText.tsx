import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
};

export default function MarqueeText({ children, speed = 15, className }: Props) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!containerRef?.current || !textRef?.current) {
      return;
    }
    const containerWidth = containerRef.current.offsetWidth;

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
