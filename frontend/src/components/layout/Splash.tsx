// Ochilish ekrani: brend lentalari va KROSS KOREA yozuvi
export function Splash({ note }: { note?: string }) {
  return (
    <div className="splash" role="status" aria-label="KROSS KOREA">
      <span className="splash__tape splash__tape--1" />
      <span className="splash__tape splash__tape--2" />
      <span className="splash__tape splash__tape--3" />
      <p className="splash__mark">
        KROSS
        <br />
        <span>KOREA</span>
      </p>
      {note && <p className="splash__note">{note}</p>}
    </div>
  );
}
