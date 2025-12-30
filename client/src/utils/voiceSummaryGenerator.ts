import type { WeekForecast } from "../services/priceForecastService";

type Language = "si" | "en";

export interface VoiceSummaryParams {
  district: string;
  language: Language;
  currentPrice: number;
  weeklyForecast: WeekForecast[];
  hasStorage: boolean;
  recommendation: "sell_now" | "sell_immediately" | "storage" | "sell_later";
}

/**
 * Generate a friendly 15-20 second voice summary for farmers
 * Simple language, no technical terms, no AI/algorithm words
 */
export const generateVoiceSummary = (params: VoiceSummaryParams): string => {
  const {
    district,
    language,
    currentPrice,
    weeklyForecast,
    hasStorage,
    recommendation,
  } = params;

  if (language === "si") {
    return generateSinhalaSummary(
      district,
      currentPrice,
      weeklyForecast,
      hasStorage,
      recommendation
    );
  } else {
    return generateEnglishSummary(
      district,
      currentPrice,
      weeklyForecast,
      hasStorage,
      recommendation
    );
  }
};

// ============= SINHALA =============
const generateSinhalaSummary = (
  district: string,
  currentPrice: number,
  weeklyForecast: WeekForecast[],
  hasStorage: boolean,
  recommendation: string
): string => {
  // Line 1: District + current week status
  const trendStatus = getTrendStatusSinhala(weeklyForecast);
  const line1 = `${district} දිස්ත්‍රික්කයේ මේ සතියේ ඉරිඟු මිල ${trendStatus}.`;

  // Line 2: Next 1-2 weeks outlook
  const outlook = getOutlookSinhala(weeklyForecast);
  const line2 = `ඉදිරි සති දෙක තුළ ${outlook}.`;

  // Line 3: Action suggestion
  let line3 = "";
  if (recommendation === "sell_now" || recommendation === "sell_immediately") {
    line3 = "දැන් විකිණීම හොඳ තීරණයකි. ඔබගේ අවශ්‍යතාවයට අනුව තීරණය ගන්න.";
  } else if (recommendation === "storage") {
    if (hasStorage) {
      line3 =
        "ඔබට ගබඩා තිබේ නම් ටිකක් රැඳී සිටීම ලාභදායකයි. මිල වැඩිවීමට බලා සිටින්න.";
    } else {
      line3 = "ඇතැම් ස්ථානයක ගබඩා කර ටිකක් රැඳී සිටීම හොඳය.";
    }
  } else {
    line3 = "තව සතියක් බලා සිටීම ලාභදායකයි. ඒ දෙයට අනුව තීරණය ගන්න.";
  }

  // Line 4: Closing
  const line4 = "ශුභ පතනක්.";

  return `${line1} ${line2} ${line3} ${line4}`;
};

const getTrendStatusSinhala = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 1) return "ස්ථාවරයි";

  if (weeklyForecast.length === 1) {
    return "ස්ථාවරයි";
  }

  const first = weeklyForecast[0].ensemble;
  const last = weeklyForecast[weeklyForecast.length - 1].ensemble;
  const percentChange = ((last - first) / first) * 100;

  if (percentChange > 3) {
    return "ඉහළ යයි";
  } else if (percentChange < -3) {
    return "පහළ යයි";
  } else {
    return "ස්ථාවරයි";
  }
};

const getOutlookSinhala = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) {
    return "ස්ථාවර තත්ත්වයක් පෙනේ";
  }

  const first = weeklyForecast[0].ensemble;
  const second = weeklyForecast[1]?.ensemble ?? first;
  const third = weeklyForecast[2]?.ensemble ?? first;

  const avg = (first + second + third) / 3;
  const change = ((avg - first) / first) * 100;

  if (change > 4) {
    return "මිල ටිකක් ඉහළ යාමේ ඉඩ තිබේ";
  } else if (change < -4) {
    return "මිල පහළ යාමේ අවස්ථාව තිබේ";
  } else {
    return "මිල ස්ථාවරයි";
  }
};

// ============= ENGLISH =============
const generateEnglishSummary = (
  district: string,
  currentPrice: number,
  weeklyForecast: WeekForecast[],
  hasStorage: boolean,
  recommendation: string
): string => {
  // Line 1: District + current week status
  const trendStatus = getTrendStatusEnglish(weeklyForecast);
  const line1 = `In ${district} district, maize prices are ${trendStatus} this week.`;

  // Line 2: Next 1-2 weeks outlook
  const outlook = getOutlookEnglish(weeklyForecast);
  const line2 = `There is a chance of ${outlook} in the next two weeks.`;

  // Line 3: Action suggestion
  let line3 = "";
  if (recommendation === "sell_now" || recommendation === "sell_immediately") {
    line3 = "Now is a good time to sell. Decide based on your needs.";
  } else if (recommendation === "storage") {
    if (hasStorage) {
      line3 =
        "If you have storage, waiting a little longer may be more profitable.";
    } else {
      line3 =
        "Storing your maize for a bit longer may help you get better prices.";
    }
  } else {
    line3 = "Waiting another week or two may give you better prices.";
  }

  // Line 4: Closing
  const line4 = "Take care.";

  return `${line1} ${line2} ${line3} ${line4}`;
};

const getTrendStatusEnglish = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 1) return "stable";

  if (weeklyForecast.length === 1) {
    return "stable";
  }

  const first = weeklyForecast[0].ensemble;
  const last = weeklyForecast[weeklyForecast.length - 1].ensemble;
  const percentChange = ((last - first) / first) * 100;

  if (percentChange > 3) {
    return "rising";
  } else if (percentChange < -3) {
    return "falling";
  } else {
    return "stable";
  }
};

const getOutlookEnglish = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) {
    return "stable market conditions";
  }

  const first = weeklyForecast[0].ensemble;
  const second = weeklyForecast[1]?.ensemble ?? first;
  const third = weeklyForecast[2]?.ensemble ?? first;

  const avg = (first + second + third) / 3;
  const change = ((avg - first) / first) * 100;

  if (change > 4) {
    return "price increase";
  } else if (change < -4) {
    return "price decrease";
  } else {
    return "stable prices";
  }
};
