// Bo'lim bayroqlari — soddalashtirilgan SVG (emoji bayroqlar Windows'da harf bo'lib ko'rinadi)
import type { Region } from '@/types';

export function Flag({ region, size = 20 }: { region: Region; size?: number }) {
  const h = Math.round((size * 2) / 3);
  if (region === 'uz') {
    return (
      <svg width={size} height={h} viewBox="0 0 30 20" aria-hidden="true" className="flag">
        <rect width="30" height="20" fill="#1EB53A" />
        <rect width="30" height="13.2" fill="#FFFFFF" />
        <rect width="30" height="6.6" fill="#0099B5" />
        <rect y="6.6" width="30" height="0.7" fill="#CE1126" />
        <rect y="12.5" width="30" height="0.7" fill="#CE1126" />
        <circle cx="5" cy="3.3" r="2.3" fill="#FFFFFF" />
        <circle cx="5.9" cy="3.3" r="2.1" fill="#0099B5" />
        <circle cx="9.2" cy="2.2" r="0.5" fill="#FFFFFF" />
        <circle cx="10.8" cy="2.2" r="0.5" fill="#FFFFFF" />
        <circle cx="9.2" cy="4.2" r="0.5" fill="#FFFFFF" />
        <circle cx="10.8" cy="4.2" r="0.5" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" aria-hidden="true" className="flag">
      <rect width="30" height="20" fill="#FFFFFF" />
      <g transform="translate(15 10) rotate(-34)">
        <circle r="5" fill="#CD2E3A" />
        <path d="M-5 0A5 5 0 0 0 5 0A2.5 2.5 0 0 0 0 0A2.5 2.5 0 0 1-5 0Z" fill="#0047A0" />
      </g>
      <g fill="#0B0B0F">
        <path d="M3.2 4.6 6.6 1.3 7.3 2 3.9 5.3zM4.4 5.8 7.8 2.5 8.5 3.2 5.1 6.5zM5.6 7 9 3.7 9.7 4.4 6.3 7.7z" />
        <path d="M26.8 15.4 23.4 18.7 22.7 18 26.1 14.7zM25.6 14.2 22.2 17.5 21.5 16.8 24.9 13.5zM24.4 13 21 16.3 20.3 15.6 23.7 12.3z" />
        <path d="M23.4 1.3 26.8 4.6 26.1 5.3 22.7 2zM22.2 2.5 25.6 5.8 24.9 6.5 21.5 3.2zM21 3.7 24.4 7 23.7 7.7 20.3 4.4z" />
        <path d="M6.6 18.7 3.2 15.4 3.9 14.7 7.3 18zM7.8 17.5 4.4 14.2 5.1 13.5 8.5 16.8zM9 16.3 5.6 13 6.3 12.3 9.7 15.6z" />
      </g>
      <rect width="30" height="20" fill="none" stroke="#E2E4EA" strokeWidth="0.8" />
    </svg>
  );
}
