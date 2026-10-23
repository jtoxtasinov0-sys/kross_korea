'use client';

// Foydalanuvchi avatari: aylanuvchi gradient halqa, Telegram rasmi yoki ism bosh harfi
import { useState } from 'react';

export function Avatar({ name, photo }: { name: string; photo?: string }) {
  const [broken, setBroken] = useState(false);
  const letter = name.trim().charAt(0).toUpperCase();

  return (
    <span className="avatar" aria-hidden="true">
      <span className="avatar__in">
        {photo && !broken ? (
          <img src={photo} alt="" width={72} height={72} onError={() => setBroken(true)} />
        ) : (
          letter || '👟'
        )}
      </span>
      <span className="avatar__dot" />
    </span>
  );
}
