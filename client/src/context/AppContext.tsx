import React, { createContext, useContext, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../services/api"; // ✅ Use global API base

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
      console.log("API_BASE =>", API_BASE);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("RAW LOGIN RESPONSE:", res.data);

      const { token: accessToken, user: authUser, profile } = res.data;

      if (!authUser || !profile) {
        console.log("Invalid login response");
        return false;
      }

      if (!data.user) {
        console.log("No user data returned");
        return false;
      }

      console.log("✅ Supabase login successful:", data.user.email);

      setUser({
        id: data.user.id,
        email: data.user.email || "",
        full_name: data.user.user_metadata?.full_name || "",
        phone: data.user.user_metadata?.phone || "",
        district: data.user.user_metadata?.district || "",
        role: data.user.user_metadata?.role || "farmer",
      });

      setToken(data.session?.access_token || "");

      console.log("Login success:", data.user.email);
      return true;
    } catch (err: any) {
      console.log("Login failed:", err.message);
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
