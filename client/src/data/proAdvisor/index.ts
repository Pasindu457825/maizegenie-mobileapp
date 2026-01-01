// src/data/proAdvisor/index.ts

export type Language = "si" | "en";

/* ---------- Lowest Level ---------- */
export interface ContentBlock {
  heading: string;
  points: string[];
}

/* ---------- Disease / Topic Level ---------- */
export interface NestedSubSection {
  title: string;
  blocks: ContentBlock[];
}

/* ---------- Category Section ---------- */
export interface SubSection {
  title: string;

  // simple sections (used in EN summary etc.)
  points?: string[];

  // complex nested structure (used in Sinhala full content)
  subsections?: NestedSubSection[];
}

/* ---------- Main Category ---------- */
export interface AdvisorCategory {
  id: string;
  title: {
    si: string;
    en: string;
  };
  sections: {
    si: SubSection[];
    en: SubSection[];
  };
}

/* ---------- IMPORT ALL CATEGORIES ---------- */
import { diseaseAndPestDamage } from "./diseaseAndPestDamage";
import { diseaseRisk } from "./diseaseRisk";
import { soilPreparation } from "./soilPreparation";
import { seedAndPlanting } from "./seedAndPlanting";
import { fertilizerManagement } from "./fertilizerManagement";
import { waterManagement } from "./waterManagement";
import { weedManagement } from "./weedManagement";
import { harvesting } from "./harvesting";
import { machineryUsage } from "./machineryUsage";
import { agroEconomicImpact } from "./agroEconomicImpact";

/* ---------- EXPORT LIST ---------- */
export const PRO_ADVISOR_CATEGORIES: AdvisorCategory[] = [
  diseaseAndPestDamage,
  diseaseRisk,
  soilPreparation,
  seedAndPlanting,
  fertilizerManagement,
  waterManagement,
  weedManagement,
  harvesting,
  machineryUsage,
  agroEconomicImpact,
];
