'use client';

// Rasmni to'liq ekranda ko'rish: ikki barmoq bilan kattalashtirish, surish, ikki marta bosish
import { useRef, useState, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { thumb } from '@/lib/utils';
import { useUi } from '@/store/uiStore';

interface Point {
  x: number;
  y: number;
}

const MAX_SCALE = 4;

export function ImageViewer({ images, index }: { images: string[]; index: number }) {
  const pop = useUi((s) => s.pop);
  const [current, setCurrent] = useState(index);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef({ startDist: 0, startScale: 1, start: { x: 0, y: 0 }, startOffset: { x: 0, y: 0 }, swipe: 0 });
  const lastTap = useRef(0);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const go = (dir: number) => {
    const next = current + dir;
    if (next < 0 || next >= images.length) return;
    setCurrent(next);
    reset();
  };

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onDown = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2) {
      g.startDist = distance();
      g.startScale = scale;
    } else {
      g.start = { x: e.clientX, y: e.clientY };
      g.startOffset = offset;
      g.swipe = 0;
      // Ikki marta bosish — kattalashtirish / qaytarish
      const now = Date.now();
      if (now - lastTap.current < 280) {
        if (scale > 1) reset();
        else setScale(2.5);
        lastTap.current = 0;
      } else lastTap.current = now;
    }
    setDragging(true);
  };

  const onMove = (e: PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2 && g.startDist > 0) {
      setScale(Math.min(MAX_SCALE, Math.max(1, (g.startScale * distance()) / g.startDist)));
      return;
    }
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (scale > 1) setOffset({ x: g.startOffset.x + dx, y: g.startOffset.y + dy });
    else g.swipe = dx;
  };

  const onUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    setDragging(false);
    const g = gesture.current;
    if (scale <= 1.05) {
      reset();
      if (g.swipe > 60) go(-1);
      else if (g.swipe < -60) go(1);
    }
    g.swipe = 0;
  };

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <img
        src={thumb(images[current], 1080)}
        alt=""
        draggable={false}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 160ms ease-out',
        }}
      />
      <button
        type="button"
        className="viewer__close"
        aria-label="Yopish"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={pop}
      >
        <Icon name="close" size={22} />
      </button>
      {images.length > 1 && (
        <span className="viewer__count">
          {current + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
