import { createContext, useContext, useMemo, useState } from "react";
import { applyReaderSettings, loadReaderSettings, saveReaderSettings, type ReaderSettings } from "../services/reader/readerSettings";

type ReaderCtx = {
  settings: ReaderSettings;
  setSettings: (next: ReaderSettings) => void;
};

const Ctx = createContext<ReaderCtx | null>(null);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [settings, setState] = useState<ReaderSettings>(() => {
    const s = loadReaderSettings();
    applyReaderSettings(s);
    return s;
  });

  const api = useMemo<ReaderCtx>(() => ({
    settings,
    setSettings: (next) => {
      setState(next);
      saveReaderSettings(next);
      applyReaderSettings(next);
    }
  }), [settings]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useReader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReader must be used within ReaderProvider");
  return ctx;
}
