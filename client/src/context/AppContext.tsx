import React, { createContext, useContext, useMemo, useState } from "react";
import axios from "axios";

export const API_BASE = "http://192.168.1.12:8000/auth"; // change to your server IP

type User = {
  id: string;
  email: string;
  role?: string;
  district?: string;
  full_name?: string;
  phone?: string;
} | null;

type AppCtx = {
  user: User;
  token: string | null;
  loading: boolean;
  setLoading: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const Ctx = createContext<AppCtx | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // SIGN IN (connects to FastAPI backend)
  // ----------------------------------------------------
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });

      const { token: accessToken, user, profile } = res.data;

      setUser({
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        district: profile.district,
        role: profile.role,
      });

      setToken(accessToken);
      console.log("Login success:", user.email);
      return true;
    } catch (err: any) {
      console.log("Login failed:", err.response?.data || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SIGN OUT
  // ----------------------------------------------------
  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo<AppCtx>(
    () => ({
      user,
      token,
      loading,
      setLoading,
      signIn,
      signOut,
    }),
    [user, token, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
