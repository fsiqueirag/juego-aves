import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastState } from "@/lib/game-ui-types";

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastRef = useRef<number | null>(null);

  const showToast = useCallback((kind: ToastState["kind"], message: string) => {
    if (toastRef.current) window.clearTimeout(toastRef.current);
    setToast({ kind, message });
    toastRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastRef.current) window.clearTimeout(toastRef.current);
    };
  }, []);

  return { toast, showToast };
}
