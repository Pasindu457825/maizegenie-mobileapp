// src/data/treatments/index.ts
import { TreatmentsData } from "./treatmentTypes";
import { grayLeafSpotTreatments } from "./grayLeafSpotTreatments";
import { commonRustTreatments } from "./commonRustTreatments";
import { leafBlightTreatments } from "./leafBlightTreatments";
import { generalTreatments } from "./generalTreatments";
import { TreatmentPriceOverrideMap } from "../../../services/diseaseTreatmentPriceApi";

export const sriLankanTreatments: TreatmentsData = {
  "gray spot": grayLeafSpotTreatments,
  "common rust": commonRustTreatments,
  "leaf blight": leafBlightTreatments,
};

const withOverriddenCost = (
  treatmentList: typeof generalTreatments,
  priceOverrides: TreatmentPriceOverrideMap
) =>
  treatmentList.map((treatment) => {
    const normalizedId = treatment.id.replace(/_(low|medium|high)$/i, "");
    const override = priceOverrides[treatment.id] ?? priceOverrides[normalizedId];

    if (!override) {
      return treatment;
    }

    return {
      ...treatment,
      costEstimate: {
        en: override.en ?? treatment.costEstimate.en,
        si: override.si ?? treatment.costEstimate.si,
        ta: override.ta ?? treatment.costEstimate.ta,
      },
    };
  });

export const buildTreatmentsWithDynamicPrices = (
  priceOverrides: TreatmentPriceOverrideMap
): TreatmentsData => {
  return Object.entries(sriLankanTreatments).reduce<TreatmentsData>(
    (acc, [diseaseKey, treatmentList]) => {
      acc[diseaseKey] = withOverriddenCost(treatmentList, priceOverrides);
      return acc;
    },
    {}
  );
};

export const buildGeneralTreatmentsWithDynamicPrices = (
  priceOverrides: TreatmentPriceOverrideMap
) => withOverriddenCost(generalTreatments, priceOverrides);

export { generalTreatments };
