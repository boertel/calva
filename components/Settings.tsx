import { useRouter } from "next/router";
import { useMemo, createContext, useContext, ReactNode } from "react";

const SettingsContext = createContext({});

interface Settings {
  timeFormat?: string;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { query } = useRouter();

  const format = Array.isArray(query.format) ? query.format[0] : query.format;
  const context: Settings = useMemo(
    () => ({
      timeFormat: format === "24h" ? "HH:mm" : "hh:mma",
    }),
    [format]
  );

  return (
    <SettingsContext.Provider value={context}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  return useContext(SettingsContext) as Settings;
}
