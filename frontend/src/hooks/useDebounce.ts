'use client';

import { useEffect, useState } from 'react';

/** Qiymat o'zgarishini kechiktirish (qidiruv uchun 350 ms) */
export function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
