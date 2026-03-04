import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./api";

export type BillingCycle = "monthly" | "annual";

export interface SubscriptionPlan {
  code: string;
  title: string;
  billing_cycle: BillingCycle;
  amount_lkr: number;
  duration_days: number;
}

export interface SubscriptionStatus {
  is_paid_user: boolean;
  is_active: boolean;
  subscription_plan?: string | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await fetch(`${API_BASE}/api/v1/subscription/plans`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load subscription plans");
  }

  return response.json();
};

export const getMySubscription = async (): Promise<SubscriptionStatus> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/v1/subscription/me`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to load subscription status");
  }

  return response.json();
};

export const createCheckout = async (billingCycle: BillingCycle) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/v1/subscription/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ billing_cycle: billingCycle }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to start checkout");
  }

  return response.json() as Promise<{
    order_id: string;
    amount_lkr: number;
    billing_cycle: BillingCycle;
    currency: string;
  }>;
};

export const confirmCheckout = async (payload: {
  order_id: string;
  billing_cycle: BillingCycle;
  card_number: string;
  card_holder: string;
  expiry_date: string;
  cvv: string;
}) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/v1/subscription/confirm`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || "Payment failed");
  }

  return body as {
    success: boolean;
    message: string;
    order_id: string;
    subscription_end_date?: string;
  };
};
