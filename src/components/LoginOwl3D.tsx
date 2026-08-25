import { useEffect, useRef, useState } from "react";

type MascotState = "watching" | "typing" | "sad" | "alert";

interface LoginOwl3DProps {
  isTyping: boolean;
  isSad: boolean;
  errorPulse?: number;
}

export default function LoginOwl3D({
  isTyping,
  isSad,
  errorPulse = 0,
}: LoginOwl3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const [uiMousePos, setUiMousePos] = useState({ x: 0, y: 0 });
  const [isAlerting, setIsAlerting] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);

  useEffect(() => {
    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const nextMouse = {
        x: clamp((e.clientX - centerX) / (rect.width / 2), -1, 1),
        y: clamp(-((e.clientY - centerY) / (rect.height / 2)), -1, 1),
      };

      if (typeof rafRef.current === "number") {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = window.requestAnimationFrame(() => {
        setUiMousePos(nextMouse);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (typeof rafRef.current === "number") {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroVisible(true), 90);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!errorPulse) return;
    setIsAlerting(true);
    const timer = window.setTimeout(() => setIsAlerting(false), 900);
    return () => window.clearTimeout(timer);
  }, [errorPulse]);

  const mascotState: MascotState = isSad
    ? isAlerting
      ? "alert"
      : "sad"
    : isTyping
      ? "typing"
      : "watching";

  const textShiftX = uiMousePos.x * 8;
  const textShiftY = -uiMousePos.y * 6;
  const glowShiftX = uiMousePos.x * 18;
  const glowShiftY = -uiMousePos.y * 14;
  const mascotShiftX = uiMousePos.x * 12;
  const mascotShiftY = -uiMousePos.y * 10;
  const mascotEmoji =
    mascotState === "alert"
      ? "😵"
      : mascotState === "sad"
        ? "😔"
        : mascotState === "typing"
          ? "🙈"
          : "🦆";
  const statusLabel =
    mascotState === "alert"
      ? "Access denied"
      : mascotState === "sad"
        ? "Try again"
        : mascotState === "typing"
          ? "Typing..."
          : "Secure mode";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-52 sm:h-60 overflow-hidden rounded-2xl"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-2xl transition-transform duration-300"
        style={{
          transform: `translate(calc(-50% + ${glowShiftX}px), calc(-50% + ${glowShiftY}px))`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background/50 to-background" />

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <p
          className="font-body text-[10px] tracking-[0.34em] uppercase text-muted-foreground/80 transition-all duration-700"
          style={{
            opacity: introVisible ? 1 : 0,
            transform: `translate3d(${textShiftX * 0.35}px, ${textShiftY * 0.35 - (introVisible ? 0 : 8)}px, 0)`,
          }}
        >
          University Application Portal Secure Access
        </p>
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div
          className="rounded-full border border-border/60 bg-background/85 shadow-[0_12px_32px_rgba(0,0,0,0.18)] px-8 py-5 transition-all duration-300"
          style={{
            transform: `translate3d(${mascotShiftX}px, ${mascotShiftY}px, 0) rotate(${uiMousePos.x * 7}deg) scale(${mascotState === "alert" ? 1.06 : mascotState === "typing" ? 0.96 : 1})`,
          }}
        >
          <p
            className="text-5xl leading-none transition-transform duration-300"
            style={{
              transform: `translateY(${mascotState === "typing" ? 5 : mascotState === "sad" ? 3 : 0}px)`,
            }}
          >
            {mascotEmoji}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <p
          className="font-heading text-xs tracking-[0.22em] uppercase text-foreground/75 transition-all duration-700"
          style={{
            opacity: introVisible ? 1 : 0,
            transform: `translate3d(${textShiftX * 0.55}px, ${textShiftY * 0.55 + (introVisible ? 0 : 10)}px, 0)`,
            textShadow: "0 6px 18px rgba(0,0,0,0.22)",
          }}
        >
          {statusLabel}
        </p>
      </div>
    </div>
  );
}
