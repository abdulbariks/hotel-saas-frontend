"use client";

import * as React from "react";

/**
 * Renders children only after hydration has completed on
 * the client. Uses `useSyncExternalStore` so the server
 * snapshot (false) matches the server-rendered HTML and
 * the client snapshot (true) takes over after hydration —
 * without any setState inside an effect.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const subscribe = React.useCallback(
    // The mounted flag never changes after hydration, so
    // the subscription never needs to notify.
    () => () => {
      // no-op unsubscribe
    },
    [],
  );

  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
