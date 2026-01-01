import { AdvisorCategory } from "./index";

export const diseaseRisk: AdvisorCategory = {
  id: "disease_risk",
  title: {
    si: "රෝග අවදානම",
    en: "Disease Risk",
  },
  sections: {
    si: [
      {
        title: "අවදානම් ලක්ෂණ",
        points: [
          "ආර්ද්‍රතාව වැඩි වීම",
          "අඛණ්ඩ වර්ෂාපතනය",
        ],
      },
    ],
    en: [
      {
        title: "Risk Factors",
        points: [
          "High humidity",
          "Continuous rainfall",
        ],
      },
    ],
  },
};
