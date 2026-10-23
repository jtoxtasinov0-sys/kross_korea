// "Savatga qo'shildi" effekti: savat tugmasidan rangli zarrachalar sochiladi

const COLORS = ['#9a8cff', 'var(--accent)', 'var(--accent-2)', '#ff9ac6', 'var(--sun)', 'var(--peach)'];

export function burstAtCart() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector('.nav__cart');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i += 1) {
    const el = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
    const dist = 50 + Math.random() * 46;
    el.className = 'burst';
    el.style.left = `${cx - 4}px`;
    el.style.top = `${cy - 4}px`;
    el.style.background = COLORS[i % COLORS.length];
    el.style.borderRadius = i % 2 ? '50%' : '2px';
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist - 20}px`);
    el.style.setProperty('--rot', `${Math.round(Math.random() * 360)}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 740);
  }
}
