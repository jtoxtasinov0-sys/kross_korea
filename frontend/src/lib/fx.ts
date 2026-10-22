// "Savatga qo'shildi" effekti: savat tugmasidan rangli zarrachalar sochiladi

const COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--hot)', 'var(--sun)', 'var(--ink)'];

export function burstAtCart() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector('.nav__cart');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 14; i += 1) {
    const el = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const dist = 46 + Math.random() * 38;
    el.className = 'burst';
    el.style.left = `${cx - 4}px`;
    el.style.top = `${cy - 4}px`;
    el.style.background = COLORS[i % COLORS.length];
    el.style.borderRadius = i % 2 ? '50%' : '2px';
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist - 20}px`);
    el.style.setProperty('--rot', `${Math.round(Math.random() * 360)}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }
}
