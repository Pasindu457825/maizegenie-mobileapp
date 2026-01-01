import { AdvisorCategory } from "./index";

export const diseaseAndPestDamage: AdvisorCategory = {
  id: "disease_pest_damage",
  title: {
    si: "රෝග හා පළිබෝධ හානි",
    en: "Disease and Pest Damage",
  },

  sections: {
    // ✅ Sinhala content — UNCHANGED (as you requested)
    si: [
      {
        title: "රෝග හානි",
        subsections: [
          {
            title: "1. පත්‍ර හා කොපු කුණුවීම (Banded Leaf and Sheath Blight)",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "මෙය Rhizoctonia solani නම් දිලීරයෙන් හටගනී.",
                  "බීජ හා පසුගිය වගා අවශේෂ මගින් රෝගය පැතිර යයි.",
                  "පත්‍ර කොපු මත වටකුරු අඳුරු දාගැටීම් දැකිය හැක.",
                  "පසුකාලීනව පත්‍ර හා කඳ කුණුවී අස්වැන්නට දැඩි බලපෑමක් සිදු වේ.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "සනීපාරක්ෂිත වගා ක්‍රම අනුගමනය කරන්න.",
                  "අධික නයිට්‍රජන් පොහොර භාවිතයෙන් වැළකී සිටින්න.",
                  "අධික ඝනත්වයෙන් වගා කිරීමෙන් වැළකී හොඳ වායු සංසරණයක් ලබාදෙන්න.",
                  "පසුගිය වගා අවශේෂ ඉවත් කර විනාශ කරන්න.",
                  "අවශ්‍ය නම් කෘෂිකාර්මික උපදේශක උපදෙස් අනුව ෆංගිසයිඩ භාවිතා කරන්න.",
                ],
              },
              {
                heading: "රෝගය වැළැක්වීම",
                points: [
                  "නිර්දේශිත වගා දින හා ක්‍රම අනුගමනය කරන්න.",
                  "හොඳ ජල බැහැර වීමක් ඇති ලෙස බිම සකස් කරන්න.",
                  "රෝග ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න.",
                  "පසෙහි පෝෂක සමානුපාතය නිසි ලෙස පවත්වාගන්න.",
                  "බෝග මාරුව (Crop rotation) භාවිතා කරන්න.",
                ],
              },
            ],
          },

          {
            title: "2. හෙල්මින්තස්පෝරියම් පත්‍ර පුල්ලි රෝගය",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "මෙය Helminthosporium Leaf Spot ලෙස හඳුන්වයි.",
                  "පත්‍ර මත තිරස් හැඩැති කුඩා පැල්ලම් දිස්වේ.",
                  "පැල්ලම් දිගට වී තද දුඹුරු වට සීමා ඇතිවේ.",
                  "දැඩි ආසාදනයකදී මුළු පත්‍රයම විනාශ වේ.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "එකම බිමෙහි දිගින් දිගටම වගා කිරීමෙන් වැළකී සිටින්න.",
                  "අධික නයිට්‍රජන් පොහොර හා අධික පැද ගැසීමෙන් වළකින්න.",
                  "රෝගය පැතිරෙන විට ආසාදිත බෝග ඉවත් කර විනාශ කරන්න.",
                  "අවශ්‍ය අවස්ථාවල ෆංගිසයිඩ භාවිතා කරන්න (උපදේශක උපදෙස් අනුව).",
                ],
              },
            ],
          },

          {
            title: "3. දුඹුරු පුල්ලි රෝගය",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "මෙය Brown Spot disease ලෙසද හඳුන්වයි.",
                  "පත්‍ර මත කුඩා කොළඹැලි/තැඹිලි පැල්ලම් දිස්වේ.",
                  "පැල්ලම් එකිනෙකාට එක්වී විශාල පුල්ලි බවට පත්වේ.",
                  "ආසාදිත ස්ථාන වියළී කඩා වැටේ.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "අධික නයිට්‍රජන් පොහොර හා අධික පැද ගැසීමෙන් වැළකී සිටින්න.",
                  "නිර්දේශිත වගා චක්‍ර ක්‍රම අනුගමනය කරන්න.",
                  "රෝගය ආරම්භයේදී හඳුනාගෙන ආසාදිත කොටස් ඉවත් කරන්න.",
                  "අත්‍යවශ්‍ය නම් ෆංගිසයිඩ භාවිතා කරන්න.",
                ],
              },
            ],
          },

          {
            title: "4. බැක්ටීරියා කළ කුණුවීම රෝගය",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "මෙය Bacterial Stalk Rot ලෙස හඳුන්වයි.",
                  "ආර්ද්‍රතාව වැඩි ප්‍රදේශවල බහුලව දැකිය හැක.",
                  "කඳ පසට ආසන්න කොටසේ මෘදු වී කඩා වැටේ.",
                  "මුළු ශාකයම කඩා වැටී දැඩි අලාභ සිදු වේ.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "වගා අවශේෂ ඉවත් කර විනාශ කරන්න.",
                  "අධික නයිට්‍රජන් හා අධික ජල සැපයුමෙන් වැළකී සිටින්න.",
                  "හොඳ ජල බැහැර වීමක් ඇති ලෙස බිම සකස් කරන්න.",
                  "රෝගයට ආසාදිත ශාක ඉවත් කර විනාශ කරන්න.",
                ],
              },
              {
                heading: "රෝගය වැළැක්වීම",
                points: [
                  "රෝග ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න.",
                  "ජලය රැඳී නොසිටින ලෙස වගා භූමිය සකස් කරන්න.",
                  "බෝග මාරුව භාවිතා කරන්න.",
                ],
              },
            ],
          },

          {
            title: "5. පොලිසෝරා මලකඩ රෝගය",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "Polisora Rust disease ලෙස හඳුන්වයි.",
                  "පත්‍ර, කොපු හා කඳ මත රතු/දුඹුරු ලප දිස්වේ.",
                  "පසුකාලීනව මුළු පත්‍රයම වියළී යයි.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "අධික පොහොර හා පැද ගැසීමෙන් වැළකී සිටින්න.",
                  "රෝගය මුල් අවස්ථාවේ හඳුනාගෙන ෆංගිසයිඩ භාවිතා කරන්න.",
                  "ආසාදිත කොටස් හා වගා අවශේෂ ඉවත් කරන්න.",
                ],
              },
            ],
          },

          {
            title: "6. නොදෘශ්‍ය පත්‍ර අගමාර්ග (Northern Leaf Blight)",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "පත්‍ර මත දිග, පටු අගමාර්ග ආකාර ලප දිස්වේ.",
                  "අධික ආසාදනයකදී පත්‍ර එකිනෙකාට එක්වී විනාශ වේ.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "ගැඹුරු සැකසීම සිදුකර රෝග පැතිරීම අඩු කරන්න.",
                  "අධික නයිට්‍රජන් භාවිතයෙන් වැළකී සිටින්න.",
                  "හොඳ වායු සංසරණයක් ලබාදෙන්න.",
                  "ජලය සමුච්චිත වීමට ඉඩ නොදෙන්න.",
                ],
              },
            ],
          },

          {
            title: "7. ඇස්පර්ජිලස් කර්නල් කුණුවීම රෝගය",
            blocks: [
              {
                heading: "රෝග ලක්ෂණ",
                points: [
                  "Aspergillus Ear Rot ලෙස හඳුන්වයි.",
                  "කරල්/ඇට මත කහටින් කොළ හෝ සුදු පුල්ලි දිස්වේ.",
                  "ඇෆ්ලටොක්සින් විෂ නිපදවයි.",
                ],
              },
              {
                heading: "රෝග පාලනය",
                points: [
                  "අස්වැන්න නිසි වේලාවේ නෙළන්න.",
                  "ආසාදිත කරල් වෙන්කර ඉවත් කරන්න.",
                  "අස්වැන්න 13%ට අඩු තෙතමනයට වියළවන්න.",
                  "ගබඩා හා මෙවලම් පිරිසිදුව තබාගන්න.",
                ],
              },
            ],
          },
        ],
      },
    ],

    // ✅ English content — ADDED (Sinhala untouched)
    en: [
      {
        title: "Disease Damage",
        subsections: [
          {
            title: "1. Banded Leaf and Sheath Blight",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Caused by the fungus Rhizoctonia solani.",
                  "Spreads through seed and residues from previous cultivation.",
                  "Dark, rounded lesions can be seen on the leaf sheath.",
                  "Later, leaves and stalk may rot, causing severe yield impact.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Follow good sanitation and hygienic cultivation practices.",
                  "Avoid excessive nitrogen fertilizer application.",
                  "Avoid overly dense planting and maintain good airflow.",
                  "Remove and destroy infected crop residues.",
                  "If needed, apply fungicide based on agricultural officer guidance.",
                ],
              },
              {
                heading: "Prevention",
                points: [
                  "Follow recommended planting dates and methods.",
                  "Prepare land with proper drainage.",
                  "Use resistant varieties where available.",
                  "Maintain a balanced nutrient ratio in the soil.",
                  "Use crop rotation.",
                ],
              },
            ],
          },

          {
            title: "2. Helminthosporium Leaf Spot",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Known as Helminthosporium Leaf Spot.",
                  "Small, horizontal-shaped spots appear on leaves.",
                  "Spots elongate and develop dark brown margins.",
                  "In severe infection, the entire leaf can be destroyed.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Avoid continuous cultivation on the same land without rotation.",
                  "Avoid excessive nitrogen fertilizer and excessive weeding that stresses plants.",
                  "When spread is observed, remove and destroy infected plants/parts.",
                  "Use fungicide when necessary (based on advisor guidance).",
                ],
              },
            ],
          },

          {
            title: "3. Brown Spot Disease",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Also known as Brown Spot disease.",
                  "Small yellowish/brownish-orange spots appear on leaves.",
                  "Spots merge and become larger patches.",
                  "Infected areas dry out and may tear/break off.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Avoid excessive nitrogen fertilizer and excessive weeding that stresses plants.",
                  "Follow the recommended crop cycle/rotation practices.",
                  "Identify early and remove infected parts.",
                  "Apply fungicide only when essential.",
                ],
              },
            ],
          },

          {
            title: "4. Bacterial Stalk Rot",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Known as Bacterial Stalk Rot.",
                  "Common in high-humidity areas.",
                  "Lower stalk area becomes soft and collapses.",
                  "Entire plant may lodge, causing severe losses.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Remove and destroy crop residues.",
                  "Avoid excessive nitrogen and excessive water supply.",
                  "Prepare land with good drainage.",
                  "Remove and destroy infected plants.",
                ],
              },
              {
                heading: "Prevention",
                points: [
                  "Use resistant varieties where available.",
                  "Prepare the field so that water does not stagnate.",
                  "Practice crop rotation.",
                ],
              },
            ],
          },

          {
            title: "5. Polisora Rust",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Known as Polisora Rust disease.",
                  "Red/brown pustules appear on leaves, sheaths, and stalk.",
                  "Later, the whole leaf may dry out.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Avoid excessive fertilizer use and excessive weeding stress.",
                  "Identify early and apply fungicide at the initial stage.",
                  "Remove infected parts and crop residues.",
                ],
              },
            ],
          },

          {
            title: "6. Northern Leaf Blight",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Long, narrow blight-like lesions appear on leaves.",
                  "Under heavy infection, lesions join together and destroy the leaf.",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Do deep soil preparation to reduce disease carryover/spread.",
                  "Avoid excessive nitrogen application.",
                  "Maintain good air circulation.",
                  "Do not allow water to accumulate in the field.",
                ],
              },
            ],
          },

          {
            title: "7. Aspergillus Ear Rot",
            blocks: [
              {
                heading: "Symptoms",
                points: [
                  "Known as Aspergillus Ear Rot.",
                  "Yellowish-green or white mold appears on cobs/kernels.",
                  "Produces aflatoxin (a harmful toxin).",
                ],
              },
              {
                heading: "Control",
                points: [
                  "Harvest at the correct time.",
                  "Separate and remove infected cobs.",
                  "Dry grain to below 13% moisture.",
                  "Keep storage areas and tools clean.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
