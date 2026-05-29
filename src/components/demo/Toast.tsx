'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue>({ notify: () => {} });

const TONE_STYLES: Record<Tone, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-primary text-white',
    icon: <CheckCircle2 size={16} className="shrink-0" />,
  },
  error: {
    bg: 'bg-[#d94e1f] text-white',
    icon: <AlertTriangle size={16} className="shrink-0" />,
  },
  info: {
    bg: 'bg-[#1c281e] text-white',
    icon: <Info size={16} className="shrink-0" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const notify = useCallback((message: string, tone: Tone = 'info') => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center"
      >
        {toasts.map((toast) => {
          const { bg, icon } = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={`${bg} flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold max-w-[90vw] pointer-events-none select-none`}
            >
              {icon}
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
