import { AdvisorCategory } from "./index";

export const soilPreparation: AdvisorCategory = {
  id: "soil_preparation",
  title: {
    si: "පස සකස්කිරීම",
    en: "Soil Preparation",
  },

  sections: {
    /* ===================== SINHALA (UNCHANGED) ===================== */
    si: [
      {
        title: "පස සකස්කිරීම",
        subsections: [
          {
            title: "1. පසෙහි පෝෂක අවශ්‍යතා",
            blocks: [
              {
                heading: "පස සාරු කිරීම",
                points: [
                  "වාණිජ මට්ටමින් බඩ ඉරිඟු වගා කරනවිට මනා කාබනික පොහොර මිශ්‍ර වූ වර්ධනශීලී පසක් අවශ්‍ය වේ. එවැනි පසක් නොමැති අවස්ථාවල අඩු වශයෙන් කාබනික පොහොර එක් කර බඩ ඉරිඟු වගා කිරීම සුදුසුය.",
                  "කුමන තත්ත්වයක් යටතේ වුව ද, එක් දිගට එකම බිමක බඩ ඉරිඟු වගා කිරීමෙන් පස නිදරු භාවයට ලක් වීමට ඉඩ නොතැබීම සැලකිල්ලට විශේෂය.",
                  "එ නිසා මුං, කව්පි, උඳු වැනි රනිල බෝග සමඟ බෝග මාරු ක්‍රමයට බඩ ඉරිඟු වගා කිරීම විශේෂයෙන් නිර්දේශ කරනු ලැබේ.",
                  "ඒ වගාවේ කාබනික ද්‍රව්‍ය සමුචිත වර්ධනය පසක් සහිත භූමියක් බඩ ඉරිඟු වගාවට ඉතාමත් යෝග්‍ය වේ.",
                  "කාබනික පොහොර අවම වශයෙන් කිලෝ 4000ක් (ටොන් 4ක්) දෙනු යෝග්‍ය වේ.",
                  "කාබනික පොහොර භාවිතයෙන් නයිට්‍රජන් පොහොර ප්‍රමාණය 25%ක පමණ අඩු කර ගැනීමට හැකිවිය හැක.",
                ],
              },
            ],
          },

          {
            title: "2. සුදුසු ඉඩමක් තෝරා ගැනීම",
            blocks: [
              {
                heading: "වගාවට සුදුසු ඉඩමක් ස්ථානය",
                points: [
                  "වියළි කලාපයේ සහ යල කන්නයේදී වාරි පහසුකම් යටතේ බඩ ඉරිඟු වගා කළ හැක.",
                  "කුඹුරු ඉඩම්වල වගා කිරීමේදී ජලය රැඳීම පාලනය කළ යුතුය.",
                  "ගොඩ ඉඩම්වල නිසි ලෙස පස සකස් කිරීම අත්‍යවශ්‍ය වේ.",
                ],
              },
              {
                heading: "බඩ ඉරිඟු වගාවට සුදුසු පස",
                points: [
                  "අධික ලෙස අම්ලික නොවන, ගැඹුරු ලෝම් පස බඩ ඉරිඟු වගාවට වඩාත් සුදුසුය.",
                ],
              },
            ],
          },

          {
            title: "3. බිම සකස් කිරීම",
            blocks: [
              {
                heading: "බිම සකස් කර ගැනීම",
                points: [
                  "සෙ.මී. 15 – 20 පමණ ගැඹුරට පස පෙරලා ගන්න.",
                  "ජලය රඳෙන ස්ථානවල අඩි සහ වටි කාමයට සකස් කිරීම සුදුසුය.",
                  "වර්ෂා පොදිය තත්ත්වයන් යටතේ බිම සමාන කර සකස් කරගත යුතුය.",
                ],
              },
            ],
          },
        ],
      },
    ],

    /* ===================== ENGLISH (ADDED – SAME STRUCTURE) ===================== */
    en: [
      {
        title: "Soil Preparation",
        subsections: [
          {
            title: "1. Soil Nutrient Requirements",
            blocks: [
              {
                heading: "Improving Soil Fertility",
                points: [
                  "For commercial maize cultivation, fertile soil enriched with organic matter is essential. If such soil is not available, organic manure should be added before planting.",
                  "Continuous maize cultivation on the same land should be avoided to prevent soil degradation.",
                  "Crop rotation with legumes such as green gram, cowpea, and black gram is strongly recommended.",
                  "Soils with accumulated organic matter are highly suitable for maize cultivation.",
                  "A minimum of 4000 kg (4 tons) of organic manure is recommended to improve soil physical and biological properties.",
                  "Using organic manure can reduce nitrogen fertilizer requirements by approximately 25%.",
                ],
              },
            ],
          },

          {
            title: "2. Selecting Suitable Land",
            blocks: [
              {
                heading: "Land Suitability for Cultivation",
                points: [
                  "Maize can be cultivated in irrigated fields during the Yala season and under moderate rainfall conditions in the dry zone.",
                  "In paddy fields, proper drainage must be ensured before maize cultivation.",
                  "Proper land preparation is critical when cultivating maize on upland fields.",
                ],
              },
              {
                heading: "Soil Suitable for Maize",
                points: [
                  "Deep loamy soils that are not excessively acidic or saline are most suitable for maize cultivation.",
                ],
              },
            ],
          },

          {
            title: "3. Land Preparation",
            blocks: [
              {
                heading: "Land Preparation Practices",
                points: [
                  "Plough the soil to a depth of approximately 15–20 cm.",
                  "In areas with poor drainage or paddy fields, ridges and furrows should be prepared.",
                  "Level the land properly to ensure uniform moisture distribution during rainfall.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
