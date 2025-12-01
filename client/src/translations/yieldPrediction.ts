/**
 * Bilingual translations for Yield Prediction screens
 * සිංහල (Sinhala) and English
 */

export type Language = 'si' | 'en';

export const translations = {
  // Location & Field Screen (Screen 1)
  locationField: {
    si: {
      title: 'ස්ථානය සහ කෙත',
      subtitle: 'පියවර 1 න් 3',
      district: 'දිස්ත්‍රික්කය',
      location: 'ස්ථානය',
      plantingDate: 'වගා කළ දිනය (අත්‍යවශ්‍ය නොවේ)',
      season: 'කන්න (ස්වයංක්‍රීයව හඳුනාගත්)',
      seasonNotDetected: 'හඳුනාගත නොමැත (අත්‍යවශ්‍ය නොවේ)',
      landSize: 'ඉඩමේ ප්‍රමාණය',
      acres: 'අක්කර',
      soilCondition: 'පස් තත්ත්වය',
      irrigationType: 'ජල සම්පාදන ක්‍රමය',
      nextButton: 'ඊළඟ',
      // Errors
      errorDistrict: 'කරුණාකර ඔබේ දිස්ත්‍රික්කය තෝරන්න.',
      errorLocation: 'කරුණාකර ඔබේ ස්ථානය තෝරන්න හෝ GPS භාවිතා කරන්න.',
      errorPlantingDateFuture: 'වගා කළ දිනය අනාගතයේ විය නොහැක.',
      errorPlantingDateOld: 'වගා කළ දිනය මාස 6 කට වඩා පැරණි විය නොහැක.',
      errorSoilCondition: 'ඔබේ කෙතට අනුව පස් තත්ත්වය තෝරන්න.',
      errorIrrigation: 'කරුණාකර ජල සම්පාදන ක්‍රමය තෝරන්න.',
      errorLandSize: 'කරුණාකර අක්කර වලින් ඉඩමේ ප්‍රමාණය ඇතුළත් කරන්න.',
      errorLandSizePositive: 'ඉඩමේ ප්‍රමාණය ධනාත්මක සංඛ්‍යාවක් විය යුතුය.',
    },
    en: {
      title: 'Location & Field',
      subtitle: 'Step 1 of 3',
      district: 'District',
      location: 'Location',
      plantingDate: 'Planting Date (Optional)',
      season: 'Season (Auto-detected)',
      seasonNotDetected: 'Not detected (optional)',
      landSize: 'Land Size',
      acres: 'Acres',
      soilCondition: 'Soil Condition',
      irrigationType: 'Irrigation Type',
      nextButton: 'Next',
      // Errors
      errorDistrict: 'Please select your district.',
      errorLocation: 'Please select your location or use GPS.',
      errorPlantingDateFuture: 'Planting date cannot be in the future.',
      errorPlantingDateOld: 'Planting date cannot be older than 6 months.',
      errorSoilCondition: 'Select soil condition based on your field.',
      errorIrrigation: 'Please select irrigation type.',
      errorLandSize: 'Please enter land size in acres.',
      errorLandSizePositive: 'Land size must be a positive number.',
    },
  },

  // Crop Information Screen (Screen 2)
  cropInformation: {
    si: {
      title: 'බෝග තොරතුරු',
      subtitle: 'පියවර 2 න් 3',
      maizeVariety: 'බඩ ඉරිඟු වර්ගය',
      selectVariety: 'වර්ගයක් තෝරන්න',
      nextButton: 'ඊළඟ',
      backButton: 'ආපසු',
      errorVariety: 'කරුණාකර ඔබේ බඩ ඉරිඟු වර්ගය තෝරන්න.',
    },
    en: {
      title: 'Crop Information',
      subtitle: 'Step 2 of 3',
      maizeVariety: 'Maize Variety',
      selectVariety: 'Select a variety',
      nextButton: 'Next',
      backButton: 'Back',
      errorVariety: 'Please select your maize variety.',
    },
  },

  // Weather Condition Screen (Screen 3)
  weatherCondition: {
    si: {
      title: 'කාලගුණ තත්ත්වය',
      subtitle: 'පියවර 3 න් 3',
      rainfallCondition: 'වර්ෂාපතන තත්ත්වය',
      autoDetect: 'ස්වයංක්‍රීයව හඳුනාගන්න',
      manualSelect: 'අතින් තෝරන්න',
      summary: 'සාරාංශය',
      predictYield: 'පුරෝකථනය කරන්න',
      backButton: 'ආපසු',
      errorRainfall: 'කරුණාකර වර්ෂාපතන තත්ත්වය තෝරන්න.',
      // Summary fields
      summaryDistrict: 'දිස්ත්‍රික්කය',
      summaryLocation: 'ස්ථානය',
      summaryPlantingDate: 'වගා කළ දිනය',
      summarySeason: 'කන්න',
      summaryLandSize: 'ඉඩමේ ප්‍රමාණය',
      summarySoilCondition: 'පස් තත්ත්වය',
      summaryIrrigation: 'ජල සම්පාදනය',
      summaryVariety: 'වර්ගය',
      summaryRainfall: 'වර්ෂාපතනය',
      notProvided: 'ලබා දී නැත',
    },
    en: {
      title: 'Weather Condition',
      subtitle: 'Step 3 of 3',
      rainfallCondition: 'Rainfall Condition',
      autoDetect: 'Auto-detect',
      manualSelect: 'Manual Select',
      summary: 'Summary',
      predictYield: 'Predict Yield',
      backButton: 'Back',
      errorRainfall: 'Please select rainfall condition.',
      // Summary fields
      summaryDistrict: 'District',
      summaryLocation: 'Location',
      summaryPlantingDate: 'Planting Date',
      summarySeason: 'Season',
      summaryLandSize: 'Land Size',
      summarySoilCondition: 'Soil Condition',
      summaryIrrigation: 'Irrigation',
      summaryVariety: 'Variety',
      summaryRainfall: 'Rainfall',
      notProvided: 'Not provided',
    },
  },

  // Loading Screen
  loading: {
    si: {
      title: 'අස්වැන්න ගණනය කරමින්...',
      analyzing: 'දත්ත විශ්ලේෂණය කරමින්',
      calculating: 'අස්වැන්න ගණනය කරමින්',
      processing: 'සැකසෙමින්',
      almostDone: 'සම්පූර්ණයි',
    },
    en: {
      title: 'Calculating Yield...',
      analyzing: 'Analyzing data',
      calculating: 'Calculating yield',
      processing: 'Processing',
      almostDone: 'Almost done',
    },
  },

  // Results Screen
  results: {
    si: {
      title: 'අස්වැන්න පුරෝකථනය',
      subtitle: 'ඔබේ ප්‍රතිඵල',
      predictedYield: 'අපේක්ෂිත අස්වැන්න',
      confidence: 'විශ්වාසනීයත්වය',
      harvestWindow: 'අස්වැන්න නෙලීමේ කාලය',
      startDate: 'ආරම්භක දිනය',
      targetDate: 'ඉලක්ක දිනය',
      endDate: 'අවසාන දිනය',
      impactFactors: 'බලපෑම් සාධක',
      newPrediction: 'නව පුරෝකථනයක්',
      backToHome: 'මුල් පිටුවට',
      // Calendar
      addToCalendar: 'දින දර්ශනයට එක් කරන්න',
      calendarAdded: 'දින දර්ශනයට එකතු කරන ලදී!',
      calendarError: 'දින දර්ශනයට එක් කිරීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      permissionDenied: 'දින දර්ශන අවසරය අවශ්‍යයි. කරුණාකර සැකසීම් වලින් අවසර ලබා දෙන්න.',
      harvestReminder: 'අස්වැන්න නෙලීමේ සිහිකැඳවීම',
      checkCalendar: 'ඔබේ දින දර්ශනය පරීක්ෂා කරන්න!',
      // Impact levels
      high: 'ඉහළ',
      medium: 'මධ්‍යම',
      low: 'අඩු',
    },
    en: {
      title: 'Yield Prediction',
      subtitle: 'Your Results',
      predictedYield: 'Predicted Yield',
      confidence: 'Confidence',
      harvestWindow: 'Harvest Window',
      startDate: 'Start Date',
      targetDate: 'Target Date',
      endDate: 'End Date',
      impactFactors: 'Impact Factors',
      newPrediction: 'New Prediction',
      backToHome: 'Back to Home',
      // Calendar
      addToCalendar: 'Add to Calendar',
      calendarAdded: 'Added to Calendar!',
      calendarError: 'Failed to add to calendar. Please try again.',
      permissionDenied: 'Calendar permission required. Please enable it in settings.',
      harvestReminder: 'Harvest Reminder',
      checkCalendar: 'Check your calendar app!',
      // Impact levels
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
  },

  // Common translations
  common: {
    si: {
      kg: 'කි.ග්‍රෑ',
      mandatory: '*',
      optional: '(අත්‍යවශ්‍ය නොවේ)',
      yes: 'ඔව්',
      no: 'නැත',
      cancel: 'අවලංගු කරන්න',
      confirm: 'තහවුරු කරන්න',
      loading: 'පූරණය වෙමින්...',
      error: 'දෝෂයකි',
      success: 'සාර්ථකයි',
    },
    en: {
      kg: 'kg',
      mandatory: '*',
      optional: '(Optional)',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },

  // Dropdown options translations
  options: {
    // Soil Conditions
    soilConditions: {
      si: {
        'Sandy Loam': 'වැලි මැටි',
        'Clay Loam': 'මැටි',
        'Red Soil': 'රතු පස',
        'Black Soil': 'කළු පස',
        'Alluvial Soil': 'ගංගා පස',
      },
      en: {
        'Sandy Loam': 'Sandy Loam',
        'Clay Loam': 'Clay Loam',
        'Red Soil': 'Red Soil',
        'Black Soil': 'Black Soil',
        'Alluvial Soil': 'Alluvial Soil',
      },
    },
    // Irrigation Types
    irrigationTypes: {
      si: {
        'Rainfed': 'වැසි ජලය',
        'Drip Irrigation': 'බිංදු ජලාශය',
        'Sprinkler': 'ඉසින ජලාශය',
        'Flood Irrigation': 'ගංවතුර ජලාශය',
      },
      en: {
        'Rainfed': 'Rainfed',
        'Drip Irrigation': 'Drip Irrigation',
        'Sprinkler': 'Sprinkler',
        'Flood Irrigation': 'Flood Irrigation',
      },
    },
    // Rainfall Conditions
    rainfallConditions: {
      si: {
        'Low': 'අඩු',
        'Medium': 'මධ්‍යම',
        'High': 'ඉහළ',
      },
      en: {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High',
      },
    },
    // Seasons
    seasons: {
      si: {
        'Maha': 'මහ',
        'Yala': 'යල',
      },
      en: {
        'Maha': 'Maha',
        'Yala': 'Yala',
      },
    },
  },
};

// Helper function to get translation
export const t = (
  section: keyof typeof translations,
  key: string,
  language: Language = 'en'
): string => {
  const sectionData = translations[section] as any;
  if (!sectionData || !sectionData[language]) return key;
  return sectionData[language][key] || key;
};

// Helper function to translate dropdown options
export const translateOption = (
  optionType: keyof typeof translations.options,
  value: string,
  language: Language = 'en'
): string => {
  const options = translations.options[optionType] as any;
  if (!options || !options[language]) return value;
  return options[language][value] || value;
};
