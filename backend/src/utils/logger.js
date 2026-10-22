// Xatoliklar va hodisalarni vaqt bilan konsolga yozish

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export const logger = {
  info: (...args) => console.log(`[${stamp()}]`, ...args),
  warn: (...args) => console.warn(`[${stamp()}] ⚠`, ...args),
  error: (...args) => console.error(`[${stamp()}] ✖`, ...args),
};
