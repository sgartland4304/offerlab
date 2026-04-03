"use client";

import { useEffect, useRef, useState } from "react";

interface RiveCanvasProps {
  src: string;
  className?: string;
  artboard?: string;
  stateMachine?: string;
}

/**
 * Lazy-loaded Rive animation component.
 * The @rive-app/canvas-lite package must be installed separately
 * when you're ready to add Rive animations:
 *   npm install @rive-app/canvas-lite
 *
 * This is a placeholder that renders a canvas and can be swapped
 * to the full Rive runtime when assets are ready.
 */
export function RiveCanvas({
  src,
  className = "",
  artboard,
  stateMachine,
}: RiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Rive integration point — will be connected once
    // @rive-app/canvas-lite is installed and .riv files are added
    void src;
    void artboard;
    void stateMachine;
    setLoaded(true);
  }, [src, artboard, stateMachine]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
    />
  );
}
