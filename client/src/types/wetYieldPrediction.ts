export interface WetYieldPredictionRequest {
  seed_variety: string;
  cob_height_cm: number;
  plant_height_cm: number;
  cob_wet_weight_g: number;
  cob_length_cm: number;
  num_seed_rows: number;
  plot_area_m2?: number;
}

export interface WetYieldPredictionResponse {
  predicted_wet_weight_field: number;
  confidence_score: number;
  input_summary: {
    seed_variety: string;
    cob_height_cm: number;
    plant_height_cm: number;
    cob_wet_weight_g: number;
    cob_length_cm: number;
    num_seed_rows: number;
    cob_to_plant_ratio: number;
    weight_per_row: number;
  };
  feature_importance: Record<string, number>;
  recommendations: string[];
  model_info: {
    model_type: string;
    target: string;
    features_used: number;
    training_samples: number;
  };
}

export interface SeedVariety {
  id: string;
  name: string;
  description: string;
  image?: any;
}

export const SEED_VARIETIES: SeedVariety[] = [
  {
    id: 'jet999',
    name: 'Jet 999',
    description: 'High-yielding hybrid variety with excellent grain quality',
  },
  {
    id: 'gt709',
    name: 'GT 709',
    description: 'Disease-resistant variety suitable for various conditions',
  },
  {
    id: 'gt200',
    name: 'GT 200',
    description: 'Early maturing variety with good stress tolerance',
  },
  {
    id: 'pacific808',
    name: 'Pacific 808',
    description: 'Drought-tolerant variety for dry zone cultivation',
  },
  {
    id: 'commando',
    name: 'Commando',
    description: 'Baseline reference variety with stable performance',
  },
];
