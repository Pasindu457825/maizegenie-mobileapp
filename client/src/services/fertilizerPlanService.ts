/**
 * Fertilizer Plan Service
 * CRUD operations for fertilizer plans stored in Supabase
 * Officers can edit plans; the system falls back to hardcoded DOA defaults if no Supabase data exists.
 */

import { supabase } from '../lib/supabase';
import { DOA_FERTILIZER_PROGRAM, CORN_VARIETIES } from '../constants/cornKnowledgeBase';

// ============================================================
// TIMEOUT / FALLBACK CONFIG
// ============================================================

const SUPABASE_TIMEOUT_MS = 5000; // 5 seconds

/**
 * Race a promise against a timeout. Rejects with 'TIMEOUT' if the promise
 * does not settle within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number = SUPABASE_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);
}

// ============================================================
// TYPES
// ============================================================

export interface FertilizerPlanRecord {
  id?: string;
  variety: string;
  variety_type: 'hybrid' | 'open_pollinated' | 'local';
  // Basal application (kg per hectare)
  basal_tsp_kg_per_ha: number;
  basal_mop_kg_per_ha: number;
  basal_urea_kg_per_ha: number;
  basal_timing: string;
  basal_instructions: string[];
  // First top dressing
  top_dress_1_urea_kg_per_ha: number;
  top_dress_1_days_after_planting: number;
  top_dress_1_timing: string;
  top_dress_1_instructions: string[];
  // Second top dressing
  top_dress_2_urea_kg_per_ha: number;
  top_dress_2_days_after_planting: number;
  top_dress_2_timing: string;
  top_dress_2_instructions: string[];
  // Organic recommendations (tons per hectare)
  organic_compost_tons_per_ha: number;
  organic_cattle_manure_tons_per_ha: number;
  organic_poultry_manure_tons_per_ha: number;
  // Variety metadata
  fertilizer_multiplier: number;
  yield_potential_min: number;
  yield_potential_max: number;
  yield_potential_avg: number;
  growth_duration_days: number;
  // Management
  is_active: boolean;
  notes: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// DEFAULT DATA BUILDER (from hardcoded constants)
// ============================================================

/**
 * Build default plan records from the hardcoded cornKnowledgeBase constants.
 * Used to seed Supabase or as fallback when no DB record exists.
 */
export function buildDefaultPlans(): FertilizerPlanRecord[] {
  const basalProgram = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'basal')!;
  const td1Program = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'top_dress_1')!;
  const td2Program = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'top_dress_2')!;

  // Base DOA amounts (per hectare, for a 1.0 multiplier hybrid)
  const baseTsp = basalProgram.fertilizers.find(f => f.type === 'TSP')!.amountPerHa;
  const baseMop = basalProgram.fertilizers.find(f => f.type === 'MOP')!.amountPerHa;
  const baseBasalUrea = basalProgram.fertilizers.find(f => f.type === 'Urea')!.amountPerHa;
  const baseTd1Urea = td1Program.fertilizers[0].amountPerHa;
  const baseTd2Urea = td2Program.fertilizers[0].amountPerHa;

  return Object.entries(CORN_VARIETIES).map(([name, v]) => {
    // Apply the variety's multiplier so each variety gets different amounts
    const m = v.fertilizerMultiplier;
    return {
      variety: name,
      variety_type: v.type,
      basal_tsp_kg_per_ha: Math.round(baseTsp * m * 10) / 10,
      basal_mop_kg_per_ha: Math.round(baseMop * m * 10) / 10,
      basal_urea_kg_per_ha: Math.round(baseBasalUrea * m * 10) / 10,
      basal_timing: basalProgram.timing,
      basal_instructions: basalProgram.instructions,
      top_dress_1_urea_kg_per_ha: Math.round(baseTd1Urea * m * 10) / 10,
      top_dress_1_days_after_planting: td1Program.daysAfterPlanting,
      top_dress_1_timing: td1Program.timing,
      top_dress_1_instructions: td1Program.instructions,
      top_dress_2_urea_kg_per_ha: Math.round(baseTd2Urea * m * 10) / 10,
      top_dress_2_days_after_planting: td2Program.daysAfterPlanting,
      top_dress_2_timing: td2Program.timing,
      top_dress_2_instructions: td2Program.instructions,
      organic_compost_tons_per_ha: 7.5,
      organic_cattle_manure_tons_per_ha: 12.5,
      organic_poultry_manure_tons_per_ha: 2.5,
      fertilizer_multiplier: v.fertilizerMultiplier,
      yield_potential_min: v.yieldPotential.min,
      yield_potential_max: v.yieldPotential.max,
      yield_potential_avg: v.yieldPotential.average,
      growth_duration_days: v.growthDuration,
      is_active: true,
      notes: '',
    };
  });
}

// ============================================================
// SUPABASE CRUD
// ============================================================

/**
 * Fetch all fertilizer plans from Supabase (raw, no timeout).
 * Returns empty array if table doesn't exist or has no rows.
 */
export async function fetchAllFertilizerPlans(): Promise<FertilizerPlanRecord[]> {
  try {
    const { data, error } = await supabase
      .from('fertilizer_plans')
      .select('*')
      .eq('is_active', true)
      .order('variety', { ascending: true });

    if (error) {
      console.warn('⚠️ Failed to fetch fertilizer plans from Supabase:', error.message);
      return [];
    }

    return (data as FertilizerPlanRecord[]) || [];
  } catch (err) {
    console.warn('⚠️ Supabase fetch error (fertilizer_plans):', err);
    return [];
  }
}

/**
 * Fetch fertilizer plans with a 5-second timeout.
 * If Supabase is slow or unreachable, instantly returns local DOA defaults.
 * Returns { plans, source } so the UI can indicate where data came from.
 */
export async function fetchPlansWithFallback(): Promise<{
  plans: FertilizerPlanRecord[];
  source: 'database' | 'local';
}> {
  try {
    const dbPlans = await withTimeout(fetchAllFertilizerPlans());
    if (dbPlans.length > 0) {
      return { plans: dbPlans, source: 'database' };
    }
    // DB returned 0 rows – use local defaults
    return { plans: buildDefaultPlans(), source: 'local' };
  } catch (err: any) {
    if (err?.message === 'TIMEOUT') {
      console.warn('⏱️ Supabase fetch timed out after 5 s – using local backup data');
    } else {
      console.warn('⚠️ Supabase fetch failed – using local backup data:', err);
    }
    return { plans: buildDefaultPlans(), source: 'local' };
  }
}

/**
 * Fetch a single fertilizer plan by variety name.
 */
export async function fetchFertilizerPlanByVariety(variety: string): Promise<FertilizerPlanRecord | null> {
  try {
    const { data, error } = await supabase
      .from('fertilizer_plans')
      .select('*')
      .eq('variety', variety)
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn(`⚠️ No Supabase plan for variety "${variety}":`, error.message);
      return null;
    }

    return data as FertilizerPlanRecord;
  } catch (err) {
    console.warn('⚠️ Supabase fetch error:', err);
    return null;
  }
}

/**
 * Fetch a single fertilizer plan by ID.
 */
export async function fetchFertilizerPlanById(id: string): Promise<FertilizerPlanRecord | null> {
  try {
    const { data, error } = await supabase
      .from('fertilizer_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn(`⚠️ No Supabase plan for id "${id}":`, error.message);
      return null;
    }

    return data as FertilizerPlanRecord;
  } catch (err) {
    console.warn('⚠️ Supabase fetch error:', err);
    return null;
  }
}

/**
 * Upsert (create or update) a fertilizer plan.
 * If a plan with the same variety already exists, it updates it.
 */
export async function upsertFertilizerPlan(
  plan: FertilizerPlanRecord,
  officerId?: string
): Promise<FertilizerPlanRecord | null> {
  try {
    const payload: any = {
      ...plan,
      updated_by: officerId || undefined,
      updated_at: new Date().toISOString(),
    };

    // If no id, set created_by
    if (!plan.id) {
      payload.created_by = officerId || undefined;
    }

    const { data, error } = await supabase
      .from('fertilizer_plans')
      .upsert(payload, { onConflict: 'variety' })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to upsert fertilizer plan:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Fertilizer plan saved:', data?.variety);
    return data as FertilizerPlanRecord;
  } catch (err) {
    console.error('❌ Upsert error:', err);
    throw err;
  }
}

/**
 * Seed all default plans into Supabase (only inserts missing varieties).
 * Useful for initial setup or when officer opens Edit screen for the first time.
 */
export async function seedDefaultPlans(officerId?: string): Promise<number> {
  const defaults = buildDefaultPlans();
  const existing = await fetchAllFertilizerPlans();
  const existingVarieties = new Set(existing.map(p => p.variety));

  const toInsert = defaults.filter(p => !existingVarieties.has(p.variety));

  if (toInsert.length === 0) {
    console.log('ℹ️ All default plans already exist in Supabase');
    return 0;
  }

  const payloads = toInsert.map(p => {
    const { id: _stripId, ...rest } = p as any;
    return {
      ...rest,
      created_by: officerId || null,
      updated_by: officerId || null,
    };
  });

  const { error } = await supabase.from('fertilizer_plans').insert(payloads);

  if (error) {
    console.error('❌ Failed to seed default plans:', error.message);
    throw new Error(error.message);
  }

  console.log(`✅ Seeded ${toInsert.length} default fertilizer plans`);
  return toInsert.length;
}

/**
 * Delete ALL existing fertilizer plans and re-seed with corrected defaults.
 * Uses a robust approach:
 *   1. Upsert correct varieties (works even without DELETE RLS policy)
 *   2. Delete stale/old varieties that are no longer needed
 */
export async function resetAndReseedPlans(officerId?: string): Promise<number> {
  const defaults = buildDefaultPlans();
  let successCount = 0;

  // 1. Upsert all correct variety plans (creates or updates)
  //    Each variety is independent – one failure does NOT block others
  for (const plan of defaults) {
    try {
      // Strip `id` to avoid sending undefined/null as PK – let Supabase auto-generate
      const { id: _stripId, ...planWithoutId } = plan as any;
      const payload: any = {
        ...planWithoutId,
        created_by: officerId || null,
        updated_by: officerId || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('fertilizer_plans')
        .upsert(payload, { onConflict: 'variety' });

      if (error) {
        console.error(`❌ Failed to upsert plan for ${plan.variety}:`, error.message);
      } else {
        successCount++;
        console.log(`✅ Upserted plan for ${plan.variety}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception upserting ${plan.variety}:`, err?.message);
    }
  }

  // 2. Deactivate old/stale varieties that shouldn't exist anymore
  //    (uses UPDATE which has RLS policy, unlike DELETE which may not)
  const STALE_VARIETIES = ['Bhadra', 'MI Maize Hybrid 02', 'GT 200', 'Unknown'];
  for (const staleName of STALE_VARIETIES) {
    const { error } = await supabase
      .from('fertilizer_plans')
      .update({ is_active: false, notes: 'Deprecated – replaced by corrected variety list' })
      .eq('variety', staleName);

    if (error) {
      console.warn(`⚠️ Could not deactivate stale variety "${staleName}":`, error.message);
    }
  }

  console.log(`✅ Reset & re-seeded ${successCount}/${defaults.length} fertilizer plans`);
  return successCount;
}

/**
 * Auto-detect stale / legacy data in Supabase and reset if needed.
 * Stale indicators:
 *   - Old variety names exist ("Bhadra", "MI Maize Hybrid 02", "GT 200", "Unknown")
 *   - All fertilizer amounts are identical (multiplier was never applied)
 * Returns true if a reset was performed.
 */
export async function migrateStaleDataIfNeeded(officerId?: string): Promise<boolean> {
  const STALE_VARIETIES = ['Bhadra', 'MI Maize Hybrid 02', 'GT 200', 'Unknown'];

  try {
    const existing = await fetchAllFertilizerPlans();
    const existingNames = existing.map(p => p.variety);

    const hasStale = STALE_VARIETIES.some(sv => existingNames.includes(sv));

    // Check if all fertilizer amounts are identical (multiplier not applied)
    // Use Number() because Supabase NUMERIC columns can return as strings
    const allSameTsp = existing.length > 1 && existing.every(
      p => Number(p.basal_tsp_kg_per_ha) === Number(existing[0].basal_tsp_kg_per_ha)
    );

    if (hasStale || allSameTsp) {
      console.log(`🔄 Stale fertilizer data detected (hasStale=${hasStale}, allSameTsp=${allSameTsp}). Auto-resetting...`);
      await resetAndReseedPlans(officerId);
      return true;
    }

    return false;
  } catch (err) {
    console.warn('⚠️ migrateStaleDataIfNeeded error:', err);
    return false;
  }
}

/**
 * Get plan for a variety – tries Supabase (with 5 s timeout) first,
 * then falls back to hardcoded default.
 */
export async function getEffectivePlan(variety: string): Promise<FertilizerPlanRecord> {
  // Try Supabase with timeout
  try {
    const dbPlan = await withTimeout(fetchFertilizerPlanByVariety(variety));
    if (dbPlan) return dbPlan;
  } catch (err: any) {
    if (err?.message === 'TIMEOUT') {
      console.warn(`⏱️ Supabase timed out fetching plan for "${variety}" – using local`);
    } else {
      console.warn(`⚠️ Supabase error for "${variety}" – using local:`, err);
    }
  }

  // Fallback to hardcoded default
  const defaults = buildDefaultPlans();
  const fallback = defaults.find(p => p.variety === variety);
  if (fallback) return fallback;

  // If variety not found at all, return generic hybrid plan
  const genericDefault = defaults[0];
  return { ...genericDefault, variety, notes: 'Generic plan (variety not found)' };
}
