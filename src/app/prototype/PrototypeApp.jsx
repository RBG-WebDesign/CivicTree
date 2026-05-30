'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';

const MODULE_LOADERS = [
  () => import('./incoming/icons.jsx'),
  () => import('./incoming/data.jsx'),
  () => import('./incoming/store.jsx'),
  () => import('./incoming/desktop_views.jsx'),
  () => import('./incoming/desktop_admin.jsx'),
  () => import('./incoming/desktop_map.jsx'),
  () => import('./incoming/mobile_screens.jsx'),
  () => import('./incoming/desktop.jsx'),
  () => import('./incoming/mobile.jsx'),
];

export default function PrototypeApp() {
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 820 ? 'mobile' : 'desktop',
  );
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;
    window.React = React;

    MODULE_LOADERS.reduce((chain, load) => chain.then(load), Promise.resolve())
      .then(() => {
        if (alive) setLoaded(true);
      })
      .catch((error) => {
        if (alive) setLoadError(error instanceof Error ? error.message : 'Prototype failed to load.');
      });

    return () => {
      alive = false;
    };
  }, []);

  const Desktop = loaded ? window.DesktopApp : null;
  const Mobile = loaded ? window.MobileApp : null;

  return (
    <main className="min-h-screen bg-[#07110d] text-white">
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0d1712] px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">CivicTree prototype</div>
            <h1 className="truncate text-lg font-black">Latest operations loop</h1>
          </div>
          <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode('desktop')}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${mode === 'desktop' ? 'bg-emerald-400 text-[#07110d]' : 'text-white/70 hover:text-white'}`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setMode('mobile')}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${mode === 'mobile' ? 'bg-emerald-400 text-[#07110d]' : 'text-white/70 hover:text-white'}`}
            >
              Mobile
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="m-auto max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
            {loadError}
          </div>
        ) : !loaded ? (
          <div className="m-auto text-sm font-bold text-white/60">Loading prototype...</div>
        ) : mode === 'desktop' && Desktop ? (
          <div className="h-[calc(100vh-65px)] min-h-[720px] overflow-hidden">
            <Desktop onExit={() => setMode('mobile')} />
          </div>
        ) : Mobile ? (
          <div className="flex flex-1 items-center justify-center overflow-auto bg-[#eef3eb] p-4">
            <div className="relative h-[812px] w-full max-w-[390px] overflow-hidden rounded-[2.35rem] border-[10px] border-[#101814] bg-white shadow-2xl">
              <Mobile onExit={() => setMode('desktop')} startOnboarding={false} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
