import { useEffect, useRef, useState } from "react";

interface MarqueeTextProps {
  children: string;
  shouldAnimateOnlyOnHover?: boolean;
}

const MarqueeText = ({
  children,
  shouldAnimateOnlyOnHover,
}: MarqueeTextProps) => {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const isOverflowing =
        textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldAnimate(isOverflowing);
    }
  }, [children, containerRef.current?.clientWidth]);

  return (
    <div
      ref={containerRef}
      className="relative w-[calc(100%-1px)] overflow-hidden whitespace-nowrap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        ref={textRef}
        className={`inline-block ${shouldAnimate && (isHovered || !shouldAnimateOnlyOnHover) ? "animate-marquee" : ""}`}
      >
        {children}
      </span>
    </div>
  );
};

export default MarqueeText;
