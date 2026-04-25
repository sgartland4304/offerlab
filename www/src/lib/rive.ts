"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Rive, Layout, Fit, Alignment } from "@rive-app/canvas-lite";

interface UseRiveOptions {
  src: string;
  artboard?: string;
  stateMachine?: string;
  autoplay?: boolean;
  fit?: Fit;
  alignment?: Alignment;
}

/**
 * Hook for loading and controlling a Rive animation.
 * Returns a canvas ref and the Rive instance for state machine inputs.
 */
export function useRive(options: UseRiveOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const riveRef = useRef<Rive | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rive = new Rive({
      src: options.src,
      canvas,
      artboard: options.artboard,
      stateMachines: options.stateMachine ? [options.stateMachine] : undefined,
      autoplay: options.autoplay ?? true,
      layout: new Layout({
        fit: options.fit ?? Fit.Contain,
        alignment: options.alignment ?? Alignment.Center,
      }),
      onLoad: () => {
        rive.resizeDrawingSurfaceToCanvas();
        setIsLoaded(true);
      },
    });

    riveRef.current = rive;

    return () => {
      rive.cleanup();
      riveRef.current = null;
      setIsLoaded(false);
    };
  }, [options.src, options.artboard, options.stateMachine, options.autoplay, options.fit, options.alignment]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const rive = riveRef.current;
    if (!canvas || !rive) return;

    const observer = new ResizeObserver(() => {
      rive.resizeDrawingSurfaceToCanvas();
    });
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [isLoaded]);

  return { canvasRef, rive: riveRef, isLoaded };
}

export { Rive, Layout, Fit, Alignment };
