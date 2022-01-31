import { useEffect } from "react";

export function useEventListener(type: string, listener: (evt: any) => void) {
  useEffect(() => {
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type, listener]);
}
