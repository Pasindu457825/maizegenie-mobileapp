import { AdvisorCategory } from "./index";

export const harvesting: AdvisorCategory = {
  id: "harvesting",
  title: {
    si: "අස්වනු ගැනීම",
    en: "Harvesting",
  },
  sections: {
    si: [
      {
        title: "අස්වනු කාලය",
        points: [
          "කොළ වියළී ආරම්භ වූ විට අස්වනු ගන්න",
          "තෙතමනය අඩු වූ විට කපාගන්න",
        ],
      },
    ],
    en: [
      {
        title: "Harvest Time",
        points: [
          "Harvest when leaves begin to dry",
          "Harvest when moisture level is low",
        ],
      },
    ],
  },
};
