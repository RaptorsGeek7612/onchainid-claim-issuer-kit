"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so this must run post-mount —
    // reading it in a lazy useState initializer would desync server/client
    // output and trigger a hydration mismatch.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode, blocked storage) — skip the notice.
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — the notice will just reappear next visit, not a big deal.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-notice" role="region" aria-label="Information sur le stockage local">
      <div className="cookie-notice-inner">
        <p>
          Ce site utilise le stockage local de votre navigateur pour mémoriser l&apos;état de votre connexion
          wallet. Aucun cookie tiers, aucun traqueur.
        </p>
        <button type="button" className="btn btn-gradient" onClick={dismiss}>
          Compris
        </button>
      </div>
    </div>
  );
}
