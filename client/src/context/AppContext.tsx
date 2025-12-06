import React, { createContext, useContext, useMemo, useState } from "react";
import axios from "axios";

export const API_BASE = "http://192.168.1.12:8000";

type User = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  district?: string;
  role?: string;
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

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      const payload = { email, password };
      console.log("Sending Login Payload:", payload);

      const res = await axios.post(`${API_BASE}/auth/login`, payload);

      console.log("RAW LOGIN RESPONSE:", res.data);

      const { token: accessToken, user: authUser, profile } = res.data;

      if (!authUser || !profile) {
        console.log("Invalid login response structure");
        return false;
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        district: profile.district ?? "",
        role: profile.role ?? "",
      });

      setToken(accessToken);

      console.log("Login success:", authUser.email);
      return true;
    } catch (err: any) {
      console.log("Login failed:", err.response?.data || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
