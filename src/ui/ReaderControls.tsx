import { useEffect, useRef, useState } from "react";
import { useReader } from "../context/ReaderContext";

export function ReaderControls() {
  const { settings, setSettings } = useReader();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="readerControls" ref={ref}>
      <button className="iconBtn" onClick={() => setOpen((v) => !v)} aria-label="Configurações de leitura" type="button">
        Aa
      </button>

      {open && (
        <div className="readerDropdown" role="menu" aria-label="Leitura">
          <div className="readerGroup">
            <div className="readerLabel">Fonte</div>
            <div className="readerRow">
              {(["sm","md","lg"] as const).map((v) => (
                <button
                  key={v}
                  className={`readerChip ${settings.fontSize===v ? "readerChipActive":""}`}
                  onClick={() => setSettings({ ...settings, fontSize: v })}
                  type="button"
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="readerGroup">
            <div className="readerLabel">Largura</div>
            <div className="readerRow">
              {(["compact","comfortable","wide"] as const).map((v) => (
                <button
                  key={v}
                  className={`readerChip ${settings.width===v ? "readerChipActive":""}`}
                  onClick={() => setSettings({ ...settings, width: v })}
                  type="button"
                >
                  {v === "compact" ? "Compacto" : v === "comfortable" ? "Conforto" : "Amplo"}
                </button>
              ))}
            </div>
          </div>

          <div className="readerGroup">
            <div className="readerLabel">Espaçamento</div>
            <div className="readerRow">
              {(["normal","comfortable"] as const).map((v) => (
                <button
                  key={v}
                  className={`readerChip ${settings.spacing===v ? "readerChipActive":""}`}
                  onClick={() => setSettings({ ...settings, spacing: v })}
                  type="button"
                >
                  {v === "normal" ? "Normal" : "Confortável"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
