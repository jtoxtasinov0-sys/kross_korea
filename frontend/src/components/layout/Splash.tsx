// Ochilish ekrani: aylanuvchi halqali logo, harfma-harf chiquvchi KROSS KOREA va yuklanish chizig'i
function Letters({ word, from }: { word: string; from: number }) {
  return (
    <span>
      {[...word].map((ch, i) => (
        <i key={i} style={{ ['--i' as string]: from + i }}>
          {ch}
        </i>
      ))}
    </span>
  );
}

export function Splash({ note }: { note?: string }) {
  return (
    <div className="splash" role="status" aria-label="KROSS KOREA">
      <span className="splash__blob splash__blob--1" />
      <span className="splash__blob splash__blob--2" />
      <span className="splash__blob splash__blob--3" />
      <div className="splash__logo">
        <img src="/images/icon-192.png" alt="" width={104} height={104} />
      </div>
      <p className="splash__mark" aria-hidden="true">
        <Letters word="KROSS" from={0} />
        <Letters word="KOREA" from={5} />
      </p>
      <span className="splash__bar" aria-hidden="true">
        <i />
      </span>
      {note && <p className="splash__note">{note}</p>}
    </div>
  );
}
