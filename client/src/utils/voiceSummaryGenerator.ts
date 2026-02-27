import type { WeekForecast } from "../services/priceForecastService";

type Language = "si" | "en" | "ta";

export interface VoiceSummaryParams {
  district: string;
  language: Language;
  currentPrice: number;
  weeklyForecast: WeekForecast[];
  hasStorage: boolean;
  recommendation: "sell_now" | "sell_immediately" | "storage" | "sell_later";
}

/**
 * Generate a detailed 5 second voice summary for farmers
 * Simple language, comprehensive information
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
      recommendation,
    );
  } else if (language === "ta") {
    return generateTamilSummary(
      district,
      currentPrice,
      weeklyForecast,
      hasStorage,
      recommendation,
    );
  } else {
    return generateEnglishSummary(
      district,
      currentPrice,
      weeklyForecast,
      hasStorage,
      recommendation,
    );
  }
};

// ============= SINHALA =============
const generateSinhalaSummary = (
  district: string,
  currentPrice: number,
  weeklyForecast: WeekForecast[],
  hasStorage: boolean,
  recommendation: string,
): string => {
  // Line 1: District greeting
  const line1 = `${district} දිස්ත්‍රික්කයේ ඉරිඟු වගා කරන ඔබට සුභ දවසක්.`;

  // Line 2: Current price and trend
  const trendStatus = getTrendStatusSinhala(weeklyForecast);
  const currentWeekPrice =
    weeklyForecast.length > 0
      ? weeklyForecast[0].ensemble.toFixed(0)
      : currentPrice.toFixed(0);

  const line2 = `මෙම සතියේ ඉරිඟු කිලෝග්‍රෑමයක් රුපියල් ${currentWeekPrice} වටිනවා. ප්‍රවණතාවය ${trendStatus}.`;

  // Line 3: Best week information
  const bestWeekInfo = getBestWeekSinhala(weeklyForecast);
  const line3 = `ඊළඟ සති අතර, ${bestWeekInfo}.`;

  // Line 4: Detailed recommendation
  let line4 = "";
  if (recommendation === "sell_now" || recommendation === "sell_immediately") {
    line4 =
      "ඔබට මුදල් අවශ්‍ය නම් දැන්ම විකිණීම හොඳ තීරණයක්. තවත් කාලය බලා සිටීමෙන් ලාභ වැඩි වීමට අවස්ථාව අඩුයි.";
  } else if (recommendation === "storage") {
    if (hasStorage) {
      line4 =
        "ඔබට හොඳ ගබඩා පහසුකම් තිබේ නම් තව සතියක් හෝ දෙකක් බලා සිටීම ලාභදායක වෙන්න පුළුවන්. ඉදිරියට මිල ටිකක් ඉහළ යාමේ ඉඩ තියෙනවා.";
    } else {
      line4 =
        "ඔබට ගබඩා පහසුකම් අඩු නම්, හැකි නම් වියළි සහ ආරක්ෂිත තැනක තබා තව සතියක් විතර බලා බලන්න. මිල වැඩි වීමට ඉඩ තියෙනවා.";
    }
  } else {
    line4 =
      "තව සතියක් හෝ දෙකක් බලා සිටීමෙන් වඩා හොඳ මිලක් ලැබෙන්න පුළුවන්. ඉදිරි සති දෙක තුනේ මිල ඉහළ යාමේ අවස්ථාව තියෙනවා.";
  }

  // Line 5: Closing
  const line5 = "ඔබගේ අවශ්‍යතාවයට අනුව තීරණය ගන්න. සුභ පැතුම්.";

  return `${line1} ${line2} ${line3} ${line4} ${line5}`;
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
    return "ඉහළ යනවා";
  } else if (percentChange < -3) {
    return "පහළ යනවා";
  } else {
    return "ස්ථාවරයි";
  }
};

const getBestWeekSinhala = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) {
    return "විශේෂ වෙනසක් නොපෙනේ";
  }

  const bestIdx = weeklyForecast.reduce(
    (best, w, i, arr) => (w.ensemble > arr[best].ensemble ? i : best),
    0,
  );

  const bestPrice = weeklyForecast[bestIdx].ensemble.toFixed(0);

  if (bestIdx === 0) {
    return `මේ සතියේ හොඳම මිල කිලෝග්‍රෑමයකට රුපියල් ${bestPrice} වටිනවා`;
  } else {
    return `සතිය ${bestIdx + 1} වන සතියේ හොඳම මිල කිලෝග්‍රෑමයකට රුපියල් ${bestPrice} වටිනවා. එතෙක් බලා සිටීම ලාභදායක වෙන්න පුළුවන්`;
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

// ============= TAMIL =============
const generateTamilSummary = (
  district: string,
  currentPrice: number,
  weeklyForecast: WeekForecast[],
  hasStorage: boolean,
  recommendation: string,
): string => {
  const line1 = `${district} மாவட்டத்தில் மக்காச்சோளம் பயிரிடும் உங்களுக்கு வணக்கம்.`;

  const trendStatus = getTrendStatusTamil(weeklyForecast);
  const currentWeekPrice =
    weeklyForecast.length > 0
      ? weeklyForecast[0].ensemble.toFixed(0)
      : currentPrice.toFixed(0);
  const line2 = `இந்த வாரம் மக்காச்சோளம் ஒரு கிலோவுக்கு ரூபாய் ${currentWeekPrice} விலை உள்ளது. போக்கு ${trendStatus}.`;

  const bestWeekInfo = getBestWeekTamil(weeklyForecast);
  const line3 = `வரும் வாரங்களில், ${bestWeekInfo}.`;

  let line4 = "";
  if (recommendation === "sell_now" || recommendation === "sell_immediately") {
    line4 =
      "இப்போது விற்பது நல்ல தீர்மானம். உடனே விற்பனை செய்வது லாபகரமாக இருக்கும்.";
  } else if (recommendation === "storage") {
    if (hasStorage) {
      line4 =
        "உங்களிடம் சேமிப்பு வசதி இருந்தால், இன்னும் ஒன்று அல்லது இரண்டு வாரம் காத்திருப்பது லாபகரமாக இருக்கும். விலை உயர வாய்ப்பு உள்ளது.";
    } else {
      line4 =
        "பொருத்தமான இடத்தில் சேமித்து இன்னும் ஒரு வாரம் காத்திருங்கள். விலை உயர வாய்ப்பு உள்ளது.";
    }
  } else {
    line4 =
      "இன்னும் ஒன்று அல்லது இரண்டு வாரம் காத்திருந்தால் சிறந்த விலை கிடைக்கும். சந்தை பகுப்பாய்வின்படி வரும் வாரங்களில் விலை உயரும் வாய்ப்பு உள்ளது.";
  }

  const line5 = "உங்கள் தேவைக்கு ஏற்ப தீர்மானம் எடுங்கள். வாழ்த்துக்கள்.";

  return `${line1} ${line2} ${line3} ${line4} ${line5}`;
};

const getTrendStatusTamil = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) return "நிலையானது";

  const first = weeklyForecast[0].ensemble;
  const last = weeklyForecast[weeklyForecast.length - 1].ensemble;
  const percentChange = ((last - first) / first) * 100;

  if (percentChange > 3) return "உயர்கிறது";
  if (percentChange < -3) return "குறைகிறது";
  return "நிலையானது";
};

const getBestWeekTamil = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) return "விலை ஒப்பீட்டளவில் நிலையாக உள்ளது";

  const bestIdx = weeklyForecast.reduce(
    (best, w, i, arr) => (w.ensemble > arr[best].ensemble ? i : best),
    0,
  );
  const bestPrice = weeklyForecast[bestIdx].ensemble.toFixed(0);

  if (bestIdx === 0) {
    return `இந்த வாரம் சிறந்த விலை ஒரு கிலோவுக்கு ரூபாய் ${bestPrice}`;
  } else {
    return `${bestIdx + 1}வது வாரத்தில் சிறந்த விலை ரூபாய் ${bestPrice} கிலோவுக்கு கிடைக்கும். அது வரை காத்திருப்பது லாபகரமாகும்`;
  }
};

// ============= ENGLISH =============
const generateEnglishSummary = (
  district: string,
  currentPrice: number,
  weeklyForecast: WeekForecast[],
  hasStorage: boolean,
  recommendation: string,
): string => {
  // Line 1: District greeting
  const line1 = `Hello farmer in ${district} district. Here is your maize price update.`;

  // Line 2: Current price and trend
  const trendStatus = getTrendStatusEnglish(weeklyForecast);
  const currentWeekPrice =
    weeklyForecast.length > 0
      ? weeklyForecast[0].ensemble.toFixed(0)
      : currentPrice.toFixed(0);
  const line2 = `This week maize prices are around rupees ${currentWeekPrice} per kilogram and the trend is ${trendStatus}.`;

  // Line 3: Best week information
  const bestWeekInfo = getBestWeekEnglish(weeklyForecast);
  const line3 = `In the coming weeks, ${bestWeekInfo}.`;

  // Line 4: Detailed recommendation
  let line4 = "";
  if (recommendation === "sell_now" || recommendation === "sell_immediately") {
    line4 = `Now is a good time to sell your maize. If you have an urgent need for money, you should sell immediately without waiting further.`;
  } else if (recommendation === "storage") {
    if (hasStorage) {
      line4 = `If you have proper storage facility, waiting one or two more weeks would be more profitable. The prices are expected to increase in the coming weeks.`;
    } else {
      line4 = `Try to store your maize in a good storage place and wait for one more week. There is good chance that prices will increase.`;
    }
  } else {
    line4 = `Waiting one or two more weeks would give you better prices. The coming two weeks show good opportunity for price increase based on market analysis.`;
  }

  // Line 5: Closing
  const line5 = `Make your decision based on your needs. Good luck with your harvest.`;

  return `${line1} ${line2} ${line3} ${line4} ${line5}`;
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

const getBestWeekEnglish = (weeklyForecast: WeekForecast[]): string => {
  if (weeklyForecast.length < 2) {
    return "prices remain relatively stable";
  }

  const bestIdx = weeklyForecast.reduce(
    (best, w, i, arr) => (w.ensemble > arr[best].ensemble ? i : best),
    0,
  );

  const bestPrice = weeklyForecast[bestIdx].ensemble.toFixed(0);

  if (bestIdx === 0) {
    return `this week offers the best price at rupees ${bestPrice} per kilogram`;
  } else {
    const weekNum = bestIdx + 1;
    return `week number ${weekNum} shows the best price around rupees ${bestPrice} per kilogram, so waiting until then would be beneficial`;
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
