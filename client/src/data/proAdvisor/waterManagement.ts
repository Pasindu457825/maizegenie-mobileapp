import { AdvisorCategory } from "./index";

export const waterManagement: AdvisorCategory = {
  id: "water_management",
  title: {
    si: "ජල කළමනාකරණය",
    en: "Water Management",
  },
  sections: {
    si: [
      {
        title: "ජල සැපයුම",
        points: [
          "අතිශය ජලය වලක්වන්න",
          "වියලි කාලයේ පාලිත ජලය ලබාදෙන්න",
        ],
      },
    ],
    en: [
      {
        title: "Water Supply",
        points: [
          "Avoid excess watering",
          "Provide controlled irrigation during dry periods",
        ],
      },
    ],
  },
};
