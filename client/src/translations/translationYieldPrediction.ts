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

  // AgriOfficer Screens
  officerSoilProfile: {
    si: {
      title: 'පස් පැතිකඩ',
      subtitle: 'පියවර 1 න් 4',
      soilPH: 'පස් pH',
      soilNitrogen: 'පස් නයිට්‍රජන් (kg/ha)',
      soilPhosphorus: 'පස් පොස්පරස් (kg/ha)',
      soilPotassium: 'පස් පොටෑසියම් (kg/ha)',
      soilType: 'පස් වර්ගය',
      organicMatter: 'කාබනික ද්‍රව්‍ය %',
      nextButton: 'ඊළඟ',
      backButton: 'ආපසු',
      // Soil types
      clay: 'මැටි',
      loam: 'ලෝම්',
      rbe: 'රතු දුඹුරු පස (RBE)',
      rbl: 'රතු දුඹුරු ලෝම් (RBL)',
      // Errors
      errorSoilPH: 'කරුණාකර පස් pH ඇතුළත් කරන්න (0-14).',
      errorNitrogen: 'කරුණාකර නයිට්‍රජන් මට්ටම ඇතුළත් කරන්න.',
      errorPhosphorus: 'කරුණාකර පොස්පරස් මට්ටම ඇතුළත් කරන්න.',
      errorPotassium: 'කරුණාකර පොටෑසියම් මට්ටම ඇතුළත් කරන්න.',
      errorSoilType: 'කරුණාකර පස් වර්ගය තෝරන්න.',
      errorOrganicMatter: 'කරුණාකර කාබනික ද්‍රව්‍ය % ඇතුළත් කරන්න (0-100).',
    },
    en: {
      title: 'Soil Profile',
      subtitle: 'Step 1 of 4',
      soilPH: 'Soil pH',
      soilNitrogen: 'Soil Nitrogen (kg/ha)',
      soilPhosphorus: 'Soil Phosphorus (kg/ha)',
      soilPotassium: 'Soil Potassium (kg/ha)',
      soilType: 'Soil Type',
      organicMatter: 'Organic Matter %',
      nextButton: 'Next',
      backButton: 'Back',
      // Soil types
      clay: 'Clay',
      loam: 'Loam',
      rbe: 'Red Brown Earth (RBE)',
      rbl: 'Red Brown Loam (RBL)',
      // Errors
      errorSoilPH: 'Please enter soil pH (0-14).',
      errorNitrogen: 'Please enter nitrogen level.',
      errorPhosphorus: 'Please enter phosphorus level.',
      errorPotassium: 'Please enter potassium level.',
      errorSoilType: 'Please select soil type.',
      errorOrganicMatter: 'Please enter organic matter % (0-100).',
    },
  },

  officerClimate: {
    si: {
      title: 'දේශගුණය සහ පරිසරය',
      subtitle: 'පියවර 2 න් 4',
      autoFetched: 'ස්වයංක්‍රීයව ලබාගත්',
      seasonalRainfall: 'කන්නයේ වර්ෂාපතනය (mm)',
      temperature: 'උෂ්ණත්වය (°C)',
      humidity: 'ආර්ද්‍රතාවය (%)',
      photoperiod: 'ආලෝක පැය',
      fetchingData: 'දත්ත ලබාගනිමින්...',
      dataFetched: 'දත්ත සාර්ථකව ලබාගන්නා ලදී',
      fetchError: 'දත්ත ලබාගැනීම අසාර්ථක විය',
      enableLocation: 'කරුණාකර දේශගුණ දත්ත ලබාගැනීමට ස්ථානය සබල කරන්න',
      nextButton: 'ඊළඟ',
      backButton: 'ආපසු',
    },
    en: {
      title: 'Climate & Environment',
      subtitle: 'Step 2 of 4',
      autoFetched: 'Auto-fetched',
      seasonalRainfall: 'Seasonal Rainfall (mm)',
      temperature: 'Temperature (°C)',
      humidity: 'Humidity (%)',
      photoperiod: 'Photoperiod / Light hours',
      fetchingData: 'Fetching data...',
      dataFetched: 'Data fetched successfully',
      fetchError: 'Failed to fetch data',
      enableLocation: 'Please enable location to fetch climate data',
      nextButton: 'Next',
      backButton: 'Back',
    },
  },

  officerCropMeasurements: {
    si: {
      title: 'බෝග මිනුම්',
      subtitle: 'පියවර 3 න් 4 (අත්‍යවශ්‍ය නොවේ)',
      optional: 'අත්‍යවශ්‍ය නොවේ',
      plantHeight: 'ශාක උස (cm)',
      cobHeight: 'කරල් උස (cm)',
      cobLength: 'කරල් දිග (cm)',
      kernelRows: 'ධාන්‍ය පේළි',
      wetWeight: 'තෙත් බර m² එකකට',
      skipButton: 'මඟ හරින්න',
      nextButton: 'ඊළඟ',
      backButton: 'ආපසු',
      fieldInspection: 'කෙත පරීක්ෂාව සිදු කළහොත් පමණක් භාවිතා කරන්න',
    },
    en: {
      title: 'Crop Measurements',
      subtitle: 'Step 3 of 4 (Optional)',
      optional: 'Optional',
      plantHeight: 'Plant height (cm)',
      cobHeight: 'Cob height (cm)',
      cobLength: 'Cob length (cm)',
      kernelRows: 'Kernel rows',
      wetWeight: 'Wet weight per m²',
      skipButton: 'Skip',
      nextButton: 'Next',
      backButton: 'Back',
      fieldInspection: 'Used only if field inspection is conducted',
    },
  },

  officerFertilizer: {
    si: {
      title: 'පොහොර කාලසටහන',
      subtitle: 'පියවර 4 න් 4',
      basalNPK: 'මූලික NPK යොදන ලද',
      topDress1: 'ඉහළ ඇඳුම 1',
      topDress2: 'ඉහළ ඇඳුම 2',
      organicFertilizer: 'කාබනික පොහොර යෙදීම',
      amount: 'ප්‍රමාණය (kg/ha)',
      date: 'දිනය',
      predictYield: 'අස්වැන්න පුරෝකථනය කරන්න',
      backButton: 'ආපසු',
      // Errors
      errorBasalNPK: 'කරුණාකර මූලික NPK ප්‍රමාණය ඇතුළත් කරන්න.',
      errorTopDress1Amount: 'කරුණාකර ඉහළ ඇඳුම 1 ප්‍රමාණය ඇතුළත් කරන්න.',
      errorTopDress1Date: 'කරුණාකර ඉහළ ඇඳුම 1 දිනය තෝරන්න.',
      errorTopDress2Amount: 'කරුණාකර ඉහළ ඇඳුම 2 ප්‍රමාණය ඇතුළත් කරන්න.',
      errorTopDress2Date: 'කරුණාකර ඉහළ ඇඳුම 2 දිනය තෝරන්න.',
    },
    en: {
      title: 'Fertilizer Scheduling',
      subtitle: 'Step 4 of 4',
      basalNPK: 'Basal NPK applied',
      topDress1: 'Top-dress 1',
      topDress2: 'Top-dress 2',
      organicFertilizer: 'Organic fertilizer application',
      amount: 'Amount (kg/ha)',
      date: 'Date',
      predictYield: 'Predict Yield',
      backButton: 'Back',
      // Errors
      errorBasalNPK: 'Please enter basal NPK amount.',
      errorTopDress1Amount: 'Please enter top-dress 1 amount.',
      errorTopDress1Date: 'Please select top-dress 1 date.',
      errorTopDress2Amount: 'Please enter top-dress 2 amount.',
      errorTopDress2Date: 'Please select top-dress 2 date.',
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
