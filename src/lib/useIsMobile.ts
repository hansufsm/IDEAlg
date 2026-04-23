import { useEffect, useState } from "react";

/**
 * Retorna `true` se a largura da janela for < 768px ou se o dispositivo
 * tiver suporte a toque (maxTouchPoints > 0).
 * Usa SSR-safe pattern (inicia como false, atualiza no cliente).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth < 768 || navigator.maxTouchPoints > 0,
      );
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
