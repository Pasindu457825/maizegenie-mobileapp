// src/data/treatments/index.ts
import { TreatmentsData } from "./treatmentTypes";
import { grayLeafSpotTreatments } from "./grayLeafSpotTreatments";
import { commonRustTreatments } from "./commonRustTreatments";
import { leafBlightTreatments } from "./leafBlightTreatments";
import { generalTreatments } from "./generalTreatments";

export const sriLankanTreatments: TreatmentsData = {
  "gray spot": grayLeafSpotTreatments,
  "common rust": commonRustTreatments,
  "northern leaf blight": leafBlightTreatments,
  "leaf blight": leafBlightTreatments,
};

export { generalTreatments };
