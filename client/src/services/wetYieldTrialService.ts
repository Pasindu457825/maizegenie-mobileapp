import { supabase } from '../lib/supabase';

export interface WetYieldTrialRecord {
  id?: string;
  officer_id?: string;
  trial_name?: string;
  field_block_id?: string;
  replicate_number?: string;
  plot_number?: number;
  seed_variety: string;
  plant_height_cm: number;
  cob_height_cm: number;
  cob_wet_weight_g: number;
  cob_length_cm: number;
  num_seed_rows: number;
  plot_area_m2?: number;
  predicted_wet_weight_field: number;
  lower_bound?: number;
  upper_bound?: number;
  total_plot_yield_kg?: number;
  confidence_score?: number;
  confidence_label?: string;
  created_at?: string;
}

export const wetYieldTrialService = {
  async saveTrialRecord(record: Omit<WetYieldTrialRecord, 'id' | 'created_at'>): Promise<WetYieldTrialRecord | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wet_yield_trials')
      .insert({ ...record, officer_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getTrialHistory(limit = 50): Promise<WetYieldTrialRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('wet_yield_trials')
      .select('*')
      .eq('officer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async deleteTrialRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('wet_yield_trials')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  buildCSV(records: WetYieldTrialRecord[]): string {
    const headers = [
      'Date', 'Trial Name', 'Field Block', 'Replicate', 'Plot No.',
      'Variety', 'Plant Height (cm)', 'Cob Height (cm)', 'Cob Weight (g)',
      'Cob Length (cm)', 'Seed Rows', 'Plot Area (m²)',
      'Wet Weight (Kg/m²)', 'Lower Bound', 'Upper Bound',
      'Total Plot Yield (Kg)', 'Confidence (%)', 'Confidence Label',
    ];

    const rows = records.map(r => [
      r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      r.trial_name || '',
      r.field_block_id || '',
      r.replicate_number || '',
      r.plot_number?.toString() || '',
      r.seed_variety,
      r.plant_height_cm,
      r.cob_height_cm,
      r.cob_wet_weight_g,
      r.cob_length_cm,
      r.num_seed_rows,
      r.plot_area_m2?.toString() || '',
      r.predicted_wet_weight_field.toFixed(4),
      r.lower_bound?.toFixed(4) || '',
      r.upper_bound?.toFixed(4) || '',
      r.total_plot_yield_kg?.toFixed(2) || '',
      r.confidence_score?.toFixed(1) || '',
      r.confidence_label || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};
