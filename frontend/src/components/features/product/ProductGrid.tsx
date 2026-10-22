'use client';

// Mahsulotlar ro'yxati — bo'lak-bo'lak chiziladi: avval 24 ta, pastga tushgan sari yana
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

const STEP = 24;

export function ProductGrid({ products }: { products: Product[] }) {
  const [limit, setLimit] = useState(STEP);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLimit(STEP);
  }, [products]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setLimit((l) => l + STEP), {
      rootMargin: '600px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, products]);

  return (
    <>
      <div className="grid">
        {products.slice(0, limit).map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i < 4} />
        ))}
      </div>
      {limit < products.length && <div ref={sentinel} className="sentinel" />}
    </>
  );
}
