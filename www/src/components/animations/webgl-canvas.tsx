"use client";

import { useEffect, useRef, useCallback } from "react";

interface WebGLCanvasProps {
  className?: string;
  onInit?: (gl: WebGLRenderingContext, canvas: HTMLCanvasElement) => void;
  onFrame?: (gl: WebGLRenderingContext, time: number) => void;
  onDestroy?: (gl: WebGLRenderingContext) => void;
}

/**
 * Generic WebGL canvas component with automatic resize handling
 * and requestAnimationFrame loop. Pass onInit/onFrame/onDestroy
 * callbacks to implement custom WebGL effects.
 */
export function WebGLCanvas({
  className = "",
  onInit,
  onFrame,
  onDestroy,
}: WebGLCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafRef = useRef<number>(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    if (glRef.current) {
      glRef.current.viewport(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    glRef.current = gl;
    handleResize();
    onInit?.(gl, canvas);

    const tick = (time: number) => {
      onFrame?.(gl, time);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (glRef.current) {
        onDestroy?.(glRef.current);
      }
    };
  }, [onInit, onFrame, onDestroy, handleResize]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
}
