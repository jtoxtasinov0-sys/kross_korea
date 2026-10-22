'use client';

// Rasm: yuklanguncha skeleton, ochilmasa keyingi rasm, birortasi bo'lmasa — KROSS placeholder
import { useCallback, useState } from 'react';
import { cx, thumb } from '@/lib/utils';

type Width = 240 | 480 | 720 | 1080;

interface Props {
  src: string | null | undefined | (string | null | undefined)[];
  width?: Width;
  alt?: string;
  className?: string;
  eager?: boolean;
  fit?: 'cover' | 'contain';
}

export function Placeholder({ className }: { className?: string }) {
  return (
    <div className={cx('img', className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <rect width="100" height="100" style={{ fill: 'var(--surface-2)' }} />
        <path d="M-10 78 L78 -10 L92 -10 L4 78Z" style={{ fill: 'var(--accent-soft)' }} />
        <path d="M8 110 L110 8 L118 8 L16 110Z" style={{ fill: 'var(--accent-2-soft)' }} />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontFamily="var(--font-display), Arial Black, sans-serif"
          fontWeight="900"
          fontSize="13"
          style={{ fill: 'var(--line-strong)' }}
        >
          KROSS
        </text>
      </svg>
    </div>
  );
}

export function Img({ src, width, alt = '', className, eager, fit = 'cover' }: Props) {
  const list = (Array.isArray(src) ? src : [src]).filter((s): s is string => !!s);
  const key = list.join('|');
  // Rasm ro'yxati o'zgarsa — birinchisidan qayta boshlaymiz (render paytida, effektsiz)
  const [state, setState] = useState({ key, index: 0 });
  if (state.key !== key) setState({ key, index: 0 });
  const [loadedUrl, setLoadedUrl] = useState('');

  const current = list[state.key === key ? state.index : 0];
  const url = current ? thumb(current, width) : '';
  const loaded = !!url && loadedUrl === url;

  // Keshdan darhol yuklangan rasm uchun onLoad kechikishi mumkin — complete'ni ham tekshiramiz
  const imgRef = useCallback(
    (el: HTMLImageElement | null) => {
      if (el?.complete && el.naturalWidth > 0) setLoadedUrl(url);
    },
    [url],
  );

  if (!current) return <Placeholder className={className} />;

  return (
    <div className={cx('img', loaded && 'img--loaded', className)}>
      {!loaded && <span className="skel" />}
      <img
        ref={imgRef}
        src={url}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        style={fit === 'contain' ? { objectFit: 'contain' } : undefined}
        onLoad={() => setLoadedUrl(url)}
        onError={() => setState((s) => ({ ...s, index: s.index + 1 }))}
      />
    </div>
  );
}
