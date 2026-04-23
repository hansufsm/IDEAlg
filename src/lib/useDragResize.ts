"use client";

/**
 * useDragResize
 * Hook para layout redimensionável com drag handle.
 * Retorna a largura do painel esquerdo em % e handlers de drag.
 */

import { useState, useCallback, useRef, useEffect } from "react";

interface UseDragResizeOptions {
  initial?: number; // initial left panel width in %
  min?: number;     // minimum %
  max?: number;     // maximum %
}

export function useDragResize({
  initial = 60,
  min = 30,
  max = 80,
}: UseDragResizeOptions = {}) {
  const [leftWidth, setLeftWidth] = useState(initial);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(max, Math.max(min, pct)));
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [min, max]);

  return { leftWidth, containerRef, onDragHandleMouseDown: onMouseDown };
}
