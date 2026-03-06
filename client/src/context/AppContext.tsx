import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../constants";
import { supabase } from "../lib/supabase";

type User = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  district?: string;
  role?: string;
  is_paid_user?: boolean;
  subscription_plan?: string | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  last_payment_order_id?: string | null;
  last_payment_amount_lkr?: number | null;
} | null;

type DiseaseModel = "local" | "roboflow";
type PestModel = "local" | "premium";

type AppCtx = {
  user: User;
  token: string | null;
  loading: boolean;
  setLoading: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  diseaseModel: DiseaseModel;
  setDiseaseModel: (v: DiseaseModel) => Promise<void>;
  pestModel: PestModel;
  setPestModel: (v: PestModel) => Promise<void>;
};

const Ctx = createContext<AppCtx | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diseaseModel, setDiseaseModelState] = useState<DiseaseModel>("local");
  const [pestModel, setPestModelState] = useState<PestModel>("local");

  const setDiseaseModel = async (value: DiseaseModel) => {
    setDiseaseModelState(value);
    await AsyncStorage.setItem("disease_model", value);
  };

  const setPestModel = async (value: PestModel) => {
    setPestModelState(value);
    await AsyncStorage.setItem("pest_model", value);
  };

  const isSubscriptionActive = (endDate?: string | null): boolean => {
    if (!endDate) return false;
    const parsed = new Date(endDate);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.getTime() > Date.now();
  };

  useEffect(() => {
    const loadModelPreference = async () => {
      const [savedDiseaseModel, savedPestModel] = await Promise.all([
        AsyncStorage.getItem("disease_model"),
        AsyncStorage.getItem("pest_model"),
      ]);

      if (savedDiseaseModel === "local" || savedDiseaseModel === "roboflow") {
        setDiseaseModelState(savedDiseaseModel);
      }
      if (savedPestModel === "local" || savedPestModel === "premium") {
        setPestModelState(savedPestModel);
      }
    };

    void loadModelPreference();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      const { data, error } = await (supabase.auth as any).signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        console.log("SUPABASE LOGIN ERROR:", error);
        return false;
      }

      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: accessToken, user: authUser, profile } = res.data;

      if (!authUser || !profile) {
        console.log("Invalid backend login response");
        return false;
      }

      const paidActive =
        Boolean(profile.is_paid_user) && isSubscriptionActive(profile.subscription_end_date);

      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        district: profile.district ?? "",
        role: profile.role ?? "",
        is_paid_user: paidActive,
        subscription_plan: profile.subscription_plan ?? null,
        subscription_start_date: profile.subscription_start_date ?? null,
        subscription_end_date: profile.subscription_end_date ?? null,
        last_payment_order_id: profile.last_payment_order_id ?? null,
        last_payment_amount_lkr: profile.last_payment_amount_lkr ?? null,
      });

      if (!paidActive) {
        setDiseaseModelState("local");
        setPestModelState("local");
        await AsyncStorage.setItem("disease_model", "local");
        await AsyncStorage.setItem("pest_model", "local");
      }

      setToken(accessToken);
      await AsyncStorage.setItem("auth_token", accessToken);
      return true;
    } catch (err: any) {
      console.log("LOGIN FAILED:", err.response?.data || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token || !user?.id) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/subscription/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const sub = await res.json();
      const paidActive = Boolean(sub.is_paid_user) && Boolean(sub.is_active);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          is_paid_user: paidActive,
          subscription_plan: sub.subscription_plan ?? null,
          subscription_start_date: sub.subscription_start_date ?? null,
          subscription_end_date: sub.subscription_end_date ?? null,
          last_payment_order_id: sub.last_payment_order_id ?? null,
          last_payment_amount_lkr: sub.last_payment_amount_lkr ?? null,
        };
      });

      if (!paidActive && diseaseModel === "roboflow") {
        setDiseaseModelState("local");
        await AsyncStorage.setItem("disease_model", "local");
      }
      if (!paidActive && pestModel === "premium") {
        setPestModelState("local");
        await AsyncStorage.setItem("pest_model", "local");
      }
    } catch (e) {
      console.log("refreshProfile failed:", e);
    }
  };

  const signOut = async () => {
    try {
      await (supabase.auth as any).signOut();
    } catch (e) {
      console.log("Supabase signOut error:", e);
    }

    setUser(null);
    setToken(null);
    setDiseaseModelState("local");
    setPestModelState("local");
    await AsyncStorage.multiRemove(["auth_token", "disease_model", "pest_model"]);
  };

  const value = useMemo<AppCtx>(
    () => ({
      user,
      token,
      loading,
      setLoading,
      signIn,
      signOut,
      refreshProfile,
      diseaseModel,
      setDiseaseModel,
      pestModel,
      setPestModel,
    }),
    [user, token, loading, diseaseModel, pestModel]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
