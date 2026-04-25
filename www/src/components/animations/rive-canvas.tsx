"use client";

import { useRive } from "@/lib/rive";
import { Fit, Alignment } from "@rive-app/canvas-lite";

interface RiveCanvasProps {
  src: string;
  className?: string;
  artboard?: string;
  stateMachine?: string;
  autoplay?: boolean;
  fit?: "contain" | "cover" | "fill" | "none";
  alignment?: "center" | "topCenter" | "bottomCenter";
}

const fitMap: Record<string, Fit> = {
  contain: Fit.Contain,
  cover: Fit.Cover,
  fill: Fit.Fill,
  none: Fit.None,
};

const alignMap: Record<string, Alignment> = {
  center: Alignment.Center,
  topCenter: Alignment.TopCenter,
  bottomCenter: Alignment.BottomCenter,
};

export function RiveCanvas({
  src,
  className = "",
  artboard,
  stateMachine,
  autoplay = true,
  fit = "contain",
  alignment = "center",
}: RiveCanvasProps) {
  const { canvasRef, isLoaded } = useRive({
    src,
    artboard,
    stateMachine,
    autoplay,
    fit: fitMap[fit],
    alignment: alignMap[alignment],
  });

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.3s" }}
    />
  );
}
