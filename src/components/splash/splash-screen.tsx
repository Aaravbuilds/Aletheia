'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const STORAGE_KEY = 'aletheia:intro:seen:v1';

const NAME = 'Aletheia';
const TAGLINE = 'Bringing what\u2019s yours into the light.';

type Phase = 'idle' | 'playing' | 'leaving' | 'done';

/**
 * Opening splash. Rendered as part of the initial server HTML so the maroon
 * canvas is the very first thing painted — the application never flashes
 * beneath it. The overlay unmounts once the animation finishes. Purely
 * decorative: reduced-motion users skip it, and JS-off users never see it.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    let skip = false;
    try {
      skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!skip && sessionStorage.getItem(STORAGE_KEY)) skip = true;
    } catch {
      // Storage blocked (private mode / iframes) — still play once this load.
    }

    if (skip) {
      setPhase('done');
      return;
    }

    setPhase('playing');

    const leave = window.setTimeout(() => {
      setPhase('leaving');
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Ignore storage failures; the overlay still exits.
      }
    }, 2400);
    const unmount = window.setTimeout(() => setPhase('done'), 3200);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(unmount);
    };
  }, []);

  useEffect(() => {
    if (phase === 'done') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === 'done') return null;

  const skip = () => {
    setPhase('leaving');
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore.
    }
  };

  return (
    <div
      aria-hidden
      onClick={skip}
      className={cn(
        'splash-root fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-canvas',
        'cursor-pointer select-none',
        phase === 'leaving' && 'splash-exit',
      )}
    >
      <div className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={1254}
          height={1254}
          className="splash-ink h-28 w-28 object-contain sm:h-36 sm:w-36"
          style={{ animationDelay: '80ms' }}
        />

        <h1 className="splash-name mt-6 font-display text-[clamp(2.75rem,8vw,5rem)] leading-none tracking-[-0.02em] text-maroon-dark">
          {NAME.split('').map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="splash-letter"
              style={{ animationDelay: `${950 + index * 50}ms` }}
            >
              {character}
            </span>
          ))}
        </h1>

        <span className="splash-rule mt-7 h-px w-24 bg-maroon/35" style={{ animationDelay: '1500ms' }} />

        <p
          className="splash-tag mt-6 font-display text-lg font-medium text-muted sm:text-xl"
          style={{ animationDelay: '1650ms' }}
        >
          {TAGLINE}
        </p>
      </div>
    </div>
  );
}