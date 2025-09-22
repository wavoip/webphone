import { useRef, useState, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  speed?: number,
  className?: string
};


export default function MarqueeText({ children, speed = 15, className }: Props) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!containerRef || !textRef) {
      return;
    }
    const containerWidth = containerRef?.current?.offsetWidth;
    const textWidth = textRef?.current?.offsetWidth;

    console.log(containerWidth, textWidth, width, 'textWidth')

    setShouldAnimate(width > containerWidth);
  }, [children, containerRef, textRef, width]);

  useEffect(() => {
    if (!textRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
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
        <span ref={textRef} className={className ?? ""}>{children}</span>
        {shouldAnimate && <span className={className ?? ""}>{children}</span>}
      </div>
    </div>
  );
}
