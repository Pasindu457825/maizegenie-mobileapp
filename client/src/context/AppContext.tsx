import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from "../services/api";
import { supabase } from "../lib/supabase"; // ⭐ IMPORTANT

// =======================
// Types
// =======================
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
  signOut: () => Promise<void>;
};

const Ctx = createContext<AppCtx | undefined>(undefined);

// =======================
// Provider
// =======================
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // =======================
  // SIGN IN (SUPABASE + BACKEND)
  // =======================
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      // --------------------------------------------------
      // 1️⃣ SUPABASE AUTH LOGIN (MANDATORY FOR NOTIFICATIONS)
      // --------------------------------------------------
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.log("❌ SUPABASE LOGIN ERROR:", error);
        return false;
      }

      console.log("✅ SUPABASE LOGIN OK:", data.user.id);

      // --------------------------------------------------
      // 2️⃣ BACKEND LOGIN (PROFILE + ROLE + API TOKEN)
      // --------------------------------------------------
      const payload = { email, password };
      console.log("Sending Login Payload:", payload);
      console.log("API_BASE =>", API_BASE);

      const res = await axios.post(`${API_BASE}/auth/login`, payload);
      console.log("RAW LOGIN RESPONSE:", res.data);

      const { token: accessToken, user: authUser, profile } = res.data;

      if (!authUser || !profile) {
        console.log("❌ Invalid backend login response");
        return false;
      }

      // --------------------------------------------------
      // 3️⃣ SAVE USER + TOKEN
      // --------------------------------------------------
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        district: profile.district ?? "",
        role: profile.role ?? "",
      });

      setToken(accessToken);
      await AsyncStorage.setItem("auth_token", accessToken);

      console.log("🎉 LOGIN SUCCESS:", authUser.email);
      return true;
    } catch (err: any) {
      console.log("❌ LOGIN FAILED:", err.response?.data || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // SIGN OUT
  // =======================
  const signOut = async () => {
    try {
      await supabase.auth.signOut(); // ⭐ IMPORTANT
    } catch (e) {
      console.log("Supabase signOut error:", e);
    }

    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("auth_token");
  };

  // =======================
  // Context value
  // =======================
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

// =======================
// Hook
// =======================
export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
