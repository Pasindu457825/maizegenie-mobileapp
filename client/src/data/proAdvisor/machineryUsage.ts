import { AdvisorCategory } from "./index";

export const machineryUsage: AdvisorCategory = {
  id: "machinery_usage",
  title: {
    si: "යන්ත්‍ර භාවිතය",
    en: "Machinery Usage",
  },
  sections: {
    si: [
      {
        title: "කෘෂි යන්ත්‍ර",
        points: [
          "බිම් සකස් කිරීම සඳහා යන්ත්‍ර භාවිත කරන්න",
          "අස්වනු නෙලීමේදී සුදුසු යන්ත්‍ර භාවිත කරන්න",
        ],
      },
    ],
    en: [
      {
        title: "Agricultural Machinery",
        points: [
          "Use machinery for land preparation",
          "Use suitable machines for harvesting",
        ],
      },
    ],
  },
};
