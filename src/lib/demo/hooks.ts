'use client';

import { useEffect, useState } from 'react';

// Returns false during SSR and the first client render, true after mount.
// Use to render seed/loading UI until the persisted store has hydrated,
// preventing hydration mismatches.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
