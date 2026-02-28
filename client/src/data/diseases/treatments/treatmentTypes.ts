// src/data/treatments/treatmentTypes.ts
export interface SriLankanTreatment {
  id: string;
  name: {
    en: string;
    si: string;
    ta: string;
  };
  availableProducts: {
    en: string[];
    si: string[];
    ta: string[];
  };
  applicationMethod: {
    en: string;
    si: string;
    ta: string;
  };
  dosage: {
    en: string;
    si: string;
    ta: string;
  };
  schedule: {
    frequency: {
      en: string;
      si: string;
      ta: string;
    };
    duration: {
      en: string;
      si: string;
      ta: string;
    };
    bestTime: {
      en: string;
      si: string;
      ta: string;
    };
  };
  safety: {
    en: string[];
    si: string[];
    ta: string[];
  };
  availability: {
    en: string[];
    si: string[];
    ta: string[];
  };
  costEstimate: {
    en: string;
    si: string;
    ta: string;
  };
  type: "organic" | "chemical";
}

export type TreatmentsData = Record<string, SriLankanTreatment[]>;
