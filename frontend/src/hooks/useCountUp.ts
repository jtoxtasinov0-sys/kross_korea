'use client';

// Son 0 dan kerakli qiymatgacha silliq sanab chiqadi (statistika, chegirma foizi)
import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now + delay;
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  return value;
}
