// Mahsulot rangi nomidan (yashil/ko'k) doirachalar uchun HEX ranglar

const COLOR_HEX: Record<string, string> = {
  oq: '#FFFFFF',
  qora: '#14141A',
  yashil: '#22A55A',
  "ko'k": '#1F5BD8',
  "to'q ko'k": '#1B2A5C',
  sariq: '#FFD23F',
  "to'q sariq": '#FF7A1A',
  salatrang: '#B5E33D',
  kulrang: '#9AA0AA',
  havorang: '#7CC4F2',
  jigarrang: '#7A4B2A',
  pushti: '#FF8FB8',
  qizil: '#E0242F',
  kumush: '#C9CDD3',
};

export function colorDots(colorUz: string | null | undefined): string[] {
  if (!colorUz) return [];
  return colorUz
    .split('/')
    .map((w) => COLOR_HEX[w.trim().replace(/[‘’`]/g, "'")])
    .filter((c): c is string => !!c)
    .slice(0, 4);
}
