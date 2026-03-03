import { supabase } from "../lib/supabase";

const TABLE_NAME = "disease_treatment_prices";

export type TreatmentPriceOverride = {
  treatment_id: string;
  price?: string | null;
  is_active?: boolean | null;
};

export type TreatmentPriceOverrideMap = Record<
  string,
  {
    en?: string;
    si?: string;
    ta?: string;
  }
>;

export async function fetchTreatmentPriceOverrides(): Promise<TreatmentPriceOverrideMap> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as TreatmentPriceOverride[];

  return rows.reduce<TreatmentPriceOverrideMap>((acc, row) => {
    const unifiedPrice = row.price ?? undefined;
    acc[row.treatment_id] = {
      en: unifiedPrice,
      si: unifiedPrice,
      ta: unifiedPrice,
    };
    return acc;
  }, {});
}

export async function fetchAllTreatmentPriceOverrides(): Promise<
  TreatmentPriceOverride[]
> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("treatment_id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as TreatmentPriceOverride[];
}

export async function upsertTreatmentPriceOverride(input: {
  treatmentId: string;
  price: string;
  isActive?: boolean;
}) {
  const payload = {
    treatment_id: input.treatmentId,
    price: input.price,
    is_active: input.isActive ?? true,
  };

  let { error: upsertError } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "treatment_id" });

  if (!upsertError) {
    return;
  }

  // Fallback for tables missing UNIQUE/PK on treatment_id.
  const upsertMsg = `${upsertError.message ?? ""} ${upsertError.details ?? ""}`.toLowerCase();
  const isOnConflictConstraintIssue =
    upsertMsg.includes("no unique") ||
    upsertMsg.includes("on conflict") ||
    upsertMsg.includes("constraint");

  if (!isOnConflictConstraintIssue) {
    throw upsertError;
  }

  let { error: insertError } = await supabase.from(TABLE_NAME).insert(payload);
  if (!insertError) {
    return;
  }

  const insertMsg = `${insertError.message ?? ""}`.toLowerCase();
  const isDuplicate =
    insertError.code === "23505" || insertMsg.includes("duplicate");

  if (!isDuplicate) {
    throw insertError;
  }

  let { error: updateError } = await supabase
    .from(TABLE_NAME)
    .update({
      price: input.price,
      is_active: input.isActive ?? true,
    })
    .eq("treatment_id", input.treatmentId);

  if (updateError) {
    throw updateError;
  }
}

export async function deleteTreatmentPriceOverride(treatmentId: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("treatment_id", treatmentId);

  if (error) {
    throw error;
  }
}
