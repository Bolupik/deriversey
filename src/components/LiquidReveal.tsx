import { useRef, useEffect, useState, useCallback } from "react";

/**
 * Liquid Distortion reveal using SVG feTurbulence filter.
 * On hover, turbulence ramps up creating a liquid distortion effect,
 * then settles to reveal the content.
 */
export function LiquidReveal({
  children,
  className = "",
  intensity = 40,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const filterId = useRef(`liquid-${Math.random().toString(36).slice(2, 8)}`);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const animRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  const animateDistortion = useCallback((target: number, speed: number = 0.06) => {
    const turb = turbRef.current;
    if (!turb) return;

    let current = parseFloat(turb.getAttribute("baseFrequency")?.split(" ")[0] || "0");

    cancelAnimationFrame(animRef.current);

    function tick() {
      current += (target - current) * speed;
      if (Math.abs(current - target) < 0.0001) {
        current = target;
      }
      turb!.setAttribute("baseFrequency", `${current} ${current}`);
      if (current !== target) {
        animRef.current = requestAnimationFrame(tick);
      }
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (hovered) {
      // Ramp up distortion then settle
      animateDistortion(0.04, 0.08);
      const settleTimer = setTimeout(() => animateDistortion(0.005, 0.04), 300);
      return () => clearTimeout(settleTimer);
    } else {
      animateDistortion(0, 0.06);
    }
  }, [hovered, animateDistortion]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* SVG filter definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId.current}>
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0 0"
              numOctaves="3"
              result="noise"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{ filter: `url(#${filterId.current})` }}
        className="transition-transform duration-500 ease-out"
      >
        {children}
      </div>
    </div>
  );
}
