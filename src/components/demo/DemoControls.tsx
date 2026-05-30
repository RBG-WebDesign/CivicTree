'use client';

import { RotateCcw } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';

export default function DemoControls() {
  const resetDemo = useDemoStore((s) => s.resetDemo);
  return (
    <button
      type="button"
      onClick={() => { resetDemo(); window.location.reload(); }}
      className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-semibold"
      title="Restore the original seeded demo data"
    >
      <RotateCcw size={12} />
      Reset demo
    </button>
  );
}
