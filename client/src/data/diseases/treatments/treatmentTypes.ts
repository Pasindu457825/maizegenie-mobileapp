// src/data/treatments/treatmentTypes.ts
export interface SriLankanTreatment {
  id: string;
  name: {
    en: string;
    si: string;
  };
  availableProducts: {
    en: string[];
    si: string[];
  };
  applicationMethod: {
    en: string;
    si: string;
  };
  dosage: {
    en: string;
    si: string;
  };
  schedule: {
    frequency: string;
    duration: string;
    bestTime: string;
  };
  safety: {
    en: string[];
    si: string[];
  };
  availability: {
    en: string[];
    si: string[];
  };
  costEstimate: string;
  type: "organic" | "chemical";
}

export type TreatmentsData = Record<string, SriLankanTreatment[]>;
