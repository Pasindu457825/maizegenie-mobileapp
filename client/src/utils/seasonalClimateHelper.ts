/**
 * Helper functions for seasonal climate data
 */

import { getSeasonalClimate } from "../constants/seasonalClimate";

/**
 * Determine season based on planting date
 * Maha: October-February (Oct=10, Nov=11, Dec=12, Jan=1, Feb=2)
 * Yala: May-September (May=5, Jun=6, Jul=7, Aug=8, Sep=9)
 */
export const getSeasonFromDate = (date: Date): "Maha" | "Yala" | null => {
    const month = date.getMonth() + 1; // 1-12

    // Maha season: October (10) to February (2)
    if (month >= 10 || month <= 2) {
        return "Maha";
    }

    // Yala season: May (5) to September (9)
    if (month >= 5 && month <= 9) {
        return "Yala";
    }

    // March-April are transition periods
    return null;
};

/**
 * Get seasonal climate data and auto-fill weather fields
 */
export const getSeasonalWeatherData = (
    district: string,
    season: "Maha" | "Yala"
): {
    seasonalTemperature: string;
    seasonalHumidity: string;
    rainfallSeasonal: string;
    rainfall30d: string;
} | null => {
    const climateData = getSeasonalClimate(district, season);

    if (!climateData) {
        return null;
    }

    // For 30-day rainfall, estimate as ~10% of total seasonal rainfall
    const rainfall30d = Math.round(climateData.total_rainfall_mm * 0.1);

    return {
        // Seasonal averages (for ML model)
        seasonalTemperature: climateData.avg_temp_c.toFixed(1),
        seasonalHumidity: climateData.avg_humidity_pct.toFixed(0),
        rainfallSeasonal: climateData.total_rainfall_mm.toFixed(0),
        rainfall30d: rainfall30d.toFixed(0)
    };
};

/**
 * Auto-fill weather data when district and season are selected
 */
export const autoFillWeatherData = (
    district: string,
    season: string,
    setters: {
        setRainfall30d: (val: string) => void;
        setSeasonalTemperature: (val: string) => void;
        setSeasonalHumidity: (val: string) => void;
        setRainfallSeasonal: (val: string) => void;
    }
): boolean => {
    console.log(`🔧 autoFillWeatherData called with district: "${district}", season: "${season}"`);
    
    if (!district || !season) {
        console.warn(`⚠️ Missing district or season`);
        return false;
    }

    const seasonType = season as "Maha" | "Yala";
    console.log(`🔧 Season type: "${seasonType}"`);
    
    const weatherData = getSeasonalWeatherData(district, seasonType);
    console.log(`🔧 Weather data retrieved:`, weatherData);

    if (!weatherData) {
        console.warn(`⚠️ No weather data found for ${district} - ${seasonType}`);
        return false;
    }

    // Set seasonal weather fields only
    console.log(`🔧 Setting weather fields:`, {
        rainfall30d: weatherData.rainfall30d,
        seasonalTemperature: weatherData.seasonalTemperature,
        seasonalHumidity: weatherData.seasonalHumidity,
        rainfallSeasonal: weatherData.rainfallSeasonal
    });
    
    setters.setRainfall30d(weatherData.rainfall30d);
    setters.setSeasonalTemperature(weatherData.seasonalTemperature);
    setters.setSeasonalHumidity(weatherData.seasonalHumidity);
    setters.setRainfallSeasonal(weatherData.rainfallSeasonal);

    console.log(`✅ Weather fields set successfully`);
    return true;
};
