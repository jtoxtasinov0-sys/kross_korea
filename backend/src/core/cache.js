// Mijozlar uchun xotira keshi — katalog har so'rovda bazadan o'qilmaydi.
// Admin biror narsani o'zgartirsa invalidate() bilan darhol tozalanadi.

const store = new Map();

export async function cached(key, ttlMs, load) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  // Bir vaqtda kelgan so'rovlar bitta yuklashni kutadi
  if (hit?.pending) return hit.pending;
  const pending = load()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    })
    .catch((err) => {
      store.delete(key);
      throw err;
    });
  store.set(key, { ...hit, pending, expires: 0 });
  return pending;
}

export function invalidate(prefix = '') {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}
