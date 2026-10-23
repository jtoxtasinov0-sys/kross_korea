// Ikonkalar to'plami — qalin chiziq (2.2px), yumaloq uchlar
import type { ReactNode } from 'react';

const PATHS = {
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.2V19a1.5 1.5 0 0 0 1.5 1.5h3.5V15h3v5.5H17a1.5 1.5 0 0 0 1.5-1.5V9.2" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="3.5" />
    </>
  ),
  heart: (
    <path d="M12 20.3s-7.4-4.5-9.1-9.3C1.7 7.6 4 4.6 7.2 4.6c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.2 0 5.5 3 4.3 6.4-1.7 4.8-9.1 9.3-9.1 9.3z" />
  ),
  bag: (
    <>
      <path d="M5 8.5h14l-1.1 10.8a2 2 0 0 1-2 1.7H8.1a2 2 0 0 1-2-1.7L5 8.5z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c.6-3.6 3.7-6 7.5-6s6.9 2.4 7.5 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.8" />
      <path d="m20 20-4.1-4.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5.5 12h13" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronDown: <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  arrowRight: <path d="M4.5 12h14.5M13.5 6.5 19 12l-5.5 5.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.2 12.4 2.7 2.7 5-5.6" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4.5M7.5 9 12 4.5 16.5 9" />
      <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h10.5v9.5H3z" />
      <path d="M13.5 9.5h4l3 3.5V16h-7" />
      <circle cx="7" cy="17.5" r="1.9" />
      <circle cx="17" cy="17.5" r="1.9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 4.8 6v5.4c0 4.5 3.1 8.2 7.2 9.4 4.1-1.2 7.2-4.9 7.2-9.4V6L12 3.2z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>
  ),
  card: (
    <>
      <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6" />
      <path d="M2.8 9.8h18.4M6.5 15h4" />
    </>
  ),
  chat: <path d="M20 11.8a7.8 7.8 0 0 1-11.4 6.9L4.2 20l1.2-4.1A7.8 7.8 0 1 1 20 11.8z" />,
  phone: (
    <path d="M5.2 3.8h3.1l1.6 4.1-2.1 1.4a11.4 11.4 0 0 0 5 5l1.4-2.1 4 1.6v3.1a2 2 0 0 1-2 2A15.1 15.1 0 0 1 3.2 5.8a2 2 0 0 1 2-2z" />
  ),
  send: (
    <>
      <path d="M20.5 3.8 3.5 10.6l6.4 2.3 2.4 6.6 3-4.4 4.6 3.4 0.6-14.7z" />
      <path d="m9.9 12.9 5.6-4.6" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.9" />
      <path d="M17.2 6.8h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.2 12h17.6M12 3.2c2.4 2.5 3.7 5.5 3.7 8.8s-1.3 6.3-3.7 8.8c-2.4-2.5-3.7-5.5-3.7-8.8S9.6 5.7 12 3.2z" />
    </>
  ),
  box: (
    <>
      <path d="M3.8 7.6 12 3.4l8.2 4.2v8.8L12 20.6l-8.2-4.2V7.6z" />
      <path d="M3.8 7.6 12 11.8l8.2-4.2M12 11.8v8.8" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M10 11v5.5M14 11v5.5" />
      <path d="M6.3 7l.9 11.6a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9L17.7 7M9 7V4.5h6V7" />
    </>
  ),
  sort: <path d="M7 4.5v15M3.8 16.3 7 19.5l3.2-3.2M17 19.5v-15M13.8 7.7 17 4.5l3.2 3.2" />,
  ruler: (
    <>
      <path d="m3.6 15.6 12-12 4.8 4.8-12 12z" />
      <path d="m7 12.2 1.8 1.8M10 9.2l1.8 1.8M13 6.2l1.8 1.8" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 11v5.2M12 7.7v.1" />
    </>
  ),
  external: (
    <>
      <path d="M14 4.5h5.5V10M19.5 4.5 11 13" />
      <path d="M17.5 14v4a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
    </>
  ),
  fire: (
    <path d="M12 20.8c3.9 0 6.8-2.6 6.8-6.5 0-3.2-1.9-5.4-3.5-7.1-.3 1.7-1.2 2.9-2.3 3.3.3-2.8-.8-5.8-3.4-7.7.2 3.1-1.6 5.2-3 6.9-1.3 1.6-1.5 2.8-1.5 4.6 0 3.9 2.9 6.5 6.9 6.5z" />
  ),
  crown: <path d="M3.8 8.3 8 12l4-6.5 4 6.5 4.2-3.7-1.6 10.2H5.4L3.8 8.3z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.2V12l3.3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 20.8s-6.8-6-6.8-11.2a6.8 6.8 0 0 1 13.6 0c0 5.2-6.8 11.2-6.8 11.2z" />
      <circle cx="12" cy="9.6" r="2.4" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m5.8 5.8 12.4 12.4" />
    </>
  ),
  receipt: (
    <>
      <path d="M5.2 3.5h13.6v17.2l-2.3-1.4-2.2 1.4-2.3-1.4-2.3 1.4-2.2-1.4-2.3 1.4V3.5z" />
      <path d="M8.6 8h6.8M8.6 11.8h6.8M8.6 15.5h4" />
    </>
  ),
  bolt: <path d="M13.2 2.8 5 13.4h6.6l-1 7.8 8.4-10.8h-6.7l.9-7.6z" />,
  chevronUp: <path d="m5.5 14.5 6.5-6.5 6.5 6.5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6z" />
    </>
  ),
  logout: (
    <>
      <path d="M14.5 4.5h-8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8" />
      <path d="M11 12h9.5M17 8.5l3.5 3.5-3.5 3.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4.5 19.5h4l10.3-10.3a2.8 2.8 0 0 0-4-4L4.5 15.5v4z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m20.5 16-5-5-9 8.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.8 4.5v4.2h-4.2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
    </>
  ),
  star: <path d="m12 3.8 2.5 5.2 5.7.7-4.2 4 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-4 5.7-.7L12 3.8z" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 22, filled = false, strokeWidth = 2.2, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
