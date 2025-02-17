interface MarqueeTextProps {
  children: string;
}
import { useEffect, useRef, useState } from "react";

const MarqueeText = ({ children }: MarqueeTextProps) => {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const isOverflowing =
        textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldAnimate(isOverflowing);
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="relative w-[200px] overflow-hidden whitespace-nowrap"
    >
      <span
        ref={textRef}
        className={`inline-block ${shouldAnimate ? "animate-marquee" : ""}`}
      >
        {children}
      </span>
    </div>
  );
};

export default MarqueeText;
