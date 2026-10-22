// Bot matnlarini til bo'yicha olish: t('ru', 'btnShop'), t('uz', 'contact', { phone })
import uz from './uz.js';
import ru from './ru.js';

const dict = { uz, ru };

export const langOf = (lang) => (lang === 'ru' ? 'ru' : 'uz');

export function t(lang, key, vars = {}) {
  const value = dict[langOf(lang)][key] ?? uz[key];
  return typeof value === 'function' ? value(vars) : value;
}

export const statusText = (lang, status) => dict[langOf(lang)].status[status] || status;
