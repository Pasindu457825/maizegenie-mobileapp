import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeCtx = {
  scheme: "light" | "dark";
  toggle: () => void;
};

const Ctx = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [scheme, setScheme] = useState<"light" | "dark">((sys ?? "light") as "light" | "dark");

  const value = useMemo(
    () => ({
      scheme,
      toggle: () => setScheme((s) => (s === "light" ? "dark" : "light")),
    }),
    [scheme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemeContext() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useThemeContext must be used within ThemeProvider");
  return v;
}
