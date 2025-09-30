import React, { createContext, useContext, useMemo, useState } from "react";

type User = { id: string; email: string } | null;

type AppCtx = {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
};

const Ctx = createContext<AppCtx | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);

  const value = useMemo<AppCtx>(
    () => ({
      user,
      loading,
      setLoading,
      signIn: async (email, password) => {
        setLoading(true);
        try {
          // TODO: call your Python backend here
          if (!email || !password) throw new Error("Missing credentials");
          setUser({ id: "1", email });
        } finally {
          setLoading(false);
        }
      },
      signOut: () => setUser(null),
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
