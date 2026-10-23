// Ko'rinishga kirganda paydo bo'lish: bitta umumiy IntersectionObserver.
// Ishlatish: <div className="rv" ref={reveal}> — bir vaqtda kirganlar navbat bilan (stagger) chiqadi

let io: IntersectionObserver | null = null;

function observer() {
  io ??= new IntersectionObserver(
    (entries) => {
      let n = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.setProperty('--d', `${Math.min(n++, 7) * 65}ms`);
        el.dataset.in = '1';
        io?.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -4% 0px', threshold: 0.06 },
  );
  return io;
}

export function reveal(el: HTMLElement | null) {
  if (!el || el.dataset.in) return;
  if (typeof IntersectionObserver === 'undefined') {
    el.dataset.in = '1';
    return;
  }
  const obs = observer();
  obs.observe(el);
  return () => obs.unobserve(el);
}
