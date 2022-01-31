import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useMemo } from "react";

const SettingsContext = createContext({});

interface Settings {
  timeFormat?: string;
  intervalFormat?: [string, string];
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { query } = useRouter();

  const format = Array.isArray(query.format) ? query.format[0] : query.format;
  const context: Settings = useMemo(
    () => ({
      timeFormat: format === "24h" ? "HH:mm" : "hh:mma",
      intervalFormat: format === "24h" ? ["HH:mm", "HH:mm"] : ["hh:mm", "hh:mma"],
    }),
    [format]
  );

  return <SettingsContext.Provider value={context}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Settings {
  return useContext(SettingsContext) as Settings;
}
