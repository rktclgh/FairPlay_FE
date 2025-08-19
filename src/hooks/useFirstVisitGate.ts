import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SESSION_ID_KEY = "fp_session_id";
const LAST_SHOWN_SESSION_KEY = "fp_splash_last_session";

const safeGet = (getter: () => string | null): string | null => {
  try {
    return getter();
  } catch {
    return null;
  }
};

const safeSet = (setter: () => void) => {
  try {
    setter();
  } catch {
    /* no-op */
  }
};

const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useFirstVisitGate = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const timersRef = useRef<number[]>([]);

  const storage = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        getItem: (_: string) => null,
        setItem: (_: string, __: string) => {},
      } as Storage;
    }
    const hasLocal = (() => {
      try {
        const k = "__fp_test__";
        window.localStorage.setItem(k, "1");
        window.localStorage.removeItem(k);
        return true;
      } catch {
        return false;
      }
    })();
    return (hasLocal ? window.localStorage : window.sessionStorage) as Storage;
  }, []);

  const ensureSessionId = useCallback((): string => {
    if (typeof window === "undefined") return "ssr";
    let sid = safeGet(() => window.sessionStorage.getItem(SESSION_ID_KEY));
    if (!sid) {
      sid = generateSessionId();
      const toSet = sid;
      safeSet(() => window.sessionStorage.setItem(SESSION_ID_KEY, toSet));
    }
    return sid!;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sid = ensureSessionId();
    const lastShown = safeGet(() => storage.getItem(LAST_SHOWN_SESSION_KEY));
    const isFirstInThisSession = lastShown !== sid;

    if (reduced) {
      safeSet(() => storage.setItem(LAST_SHOWN_SESSION_KEY, sid));
      setShouldShow(false);
      return;
    }
    setShouldShow(isFirstInThisSession);
  }, [ensureSessionId, storage]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
      }
    };
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window === "undefined") return;
    const sid = ensureSessionId();
    safeSet(() => storage.setItem(LAST_SHOWN_SESSION_KEY, sid));
    setShouldShow(false);
  }, [ensureSessionId, storage]);

  return { shouldShow, dismiss };
};
