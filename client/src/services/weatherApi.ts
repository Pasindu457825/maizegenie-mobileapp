/**
 * OpenWeatherMap API Service
 * Fetches weather and climate data for yield prediction
 */

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'bd96af430c3e364afbc4cfe5c7f76f79';
const OPENWEATHER_BASE_URL = process.env.EXPO_PUBLIC_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number; // in Celsius
  humidity: number; // in percentage
  rainfall: number; // in mm (from last hour or day)
  description: string;
  windSpeed: number;
  pressure: number;
}

export interface ClimateData {
  seasonal_rainfall: string; // mm
  temperature: string; // °C
  humidity: string; // %
  photoperiod: string; // hours
}

/**
 * Calculate photoperiod (daylight hours) based on latitude and date
 * Uses simplified formula for agricultural purposes
 */
export const calculatePhotoperiod = (latitude: number, date: Date = new Date()): number => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const latRad = (latitude * Math.PI) / 180;
  
  // Solar declination
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
  const declinationRad = (declination * Math.PI) / 180;
  
  // Hour angle
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declinationRad));
  
  // Daylight hours
  const daylightHours = (2 * hourAngle * 180) / (15 * Math.PI);
  
  return Math.round(daylightHours * 10) / 10; // Round to 1 decimal
};

/**
 * Fetch current weather data by coordinates
 */
export const fetchWeatherByCoordinates = async (
  lat: number,
  lng: number
): Promise<WeatherData> => {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      description: data.weather[0]?.description || 'N/A',
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetch historical/forecast data for seasonal rainfall estimation
 * This is a simplified version - you may want to use a more sophisticated API
 */
export const fetchSeasonalRainfall = async (
  lat: number,
  lng: number
): Promise<number> => {
  try {
    // For now, we'll use current weather data
    // In production, you might want to use historical data API or forecast API
    const weather = await fetchWeatherByCoordinates(lat, lng);
    
    // Estimate seasonal rainfall (this is simplified - replace with actual historical data)
    // For Sri Lanka, typical seasonal rainfall ranges from 800-2500mm
    // This is a placeholder - you should integrate with historical weather data
    const estimatedSeasonalRainfall = weather.rainfall > 0 
      ? Math.round(weather.rainfall * 90) // Rough estimate for 3-month season
      : 1200; // Default average for Sri Lanka
    
    return estimatedSeasonalRainfall;
  } catch (error) {
    console.error('Error fetching seasonal rainfall:', error);
    throw error;
  }
};

/**
 * Fetch complete climate data for yield prediction
 */
export const fetchClimateData = async (
  lat: number,
  lng: number,
  district?: string
): Promise<ClimateData> => {
  try {
    // Fetch current weather
    const weather = await fetchWeatherByCoordinates(lat, lng);
    
    // Fetch seasonal rainfall estimate
    const seasonalRainfall = await fetchSeasonalRainfall(lat, lng);
    
    // Calculate photoperiod
    const photoperiod = calculatePhotoperiod(lat);
    
    return {
      seasonal_rainfall: seasonalRainfall.toString(),
      temperature: weather.temperature.toString(),
      humidity: weather.humidity.toString(),
      photoperiod: photoperiod.toString(),
    };
  } catch (error) {
    console.error('Error fetching climate data:', error);
    throw error;
  }
};

/**
 * Fetch weather by district name (fallback if GPS not available)
 */
export const fetchWeatherByDistrict = async (district: string): Promise<WeatherData> => {
  try {
    // District coordinates mapping for Sri Lanka
    const districtCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
      'Monaragala': { lat: 6.8728, lng: 81.3507 },
      'Badulla': { lat: 6.9934, lng: 81.0550 },
      'Ampara': { lat: 7.2914, lng: 81.6747 },
      'Hambantota': { lat: 6.1429, lng: 81.1212 },
      'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
      'Kurunegala': { lat: 7.4867, lng: 80.3647 },
      'Puttalam': { lat: 8.0362, lng: 79.8283 },
    };
    
    const coords = districtCoordinates[district];
    
    if (!coords) {
      throw new Error(`Coordinates not found for district: ${district}`);
    }
    
    return await fetchWeatherByCoordinates(coords.lat, coords.lng);
  } catch (error) {
    console.error('Error fetching weather by district:', error);
    throw error;
  }
};

/**
 * Location-specific coordinates for accurate weather data
 */
export const LOCATION_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  // Anuradhapura District
  'Eppawala': { lat: 8.2833, lng: 80.4667 },
  'Tambuttegama': { lat: 8.0167, lng: 80.5000 },
  'Nochchiyagama': { lat: 8.3833, lng: 80.2333 },
  'Kahatagasdigiliya': { lat: 8.4500, lng: 80.7167 },
  'Horowpathana': { lat: 8.3167, lng: 80.3833 },
  
  // Monaragala District
  'Siyambalanduwa': { lat: 6.7333, lng: 81.5333 },
  'Wellawaya': { lat: 6.7333, lng: 81.1000 },
  'Buttala': { lat: 6.7500, lng: 81.2333 },
  'Thanamalwila': { lat: 6.4333, lng: 81.1833 },
  
  // Ampara District
  'Maha Oya': { lat: 7.4167, lng: 81.5333 },
  'Padiyathalawa': { lat: 7.7167, lng: 81.0333 },
  'Dehiattakandiya': { lat: 7.9167, lng: 81.1167 },
  
  // Badulla District
  'Mahiyanganaya': { lat: 7.3333, lng: 81.0000 },
  'Rideemaliyadda': { lat: 7.2667, lng: 81.1333 },
  
  // Hambantota District
  'Hambantota': { lat: 6.1244, lng: 81.1185 },
  'Tangalle': { lat: 6.0244, lng: 80.7975 },
  'Tissamaharama': { lat: 6.2833, lng: 81.2833 },
  
  // Polonnaruwa District
  'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'Medirigiriya': { lat: 8.0167, lng: 80.9667 },
  'Hingurakgoda': { lat: 8.0500, lng: 80.9667 },
  
  // Kurunegala District
  'Kurunegala': { lat: 7.4867, lng: 80.3647 },
  'Maho': { lat: 7.8333, lng: 80.2500 },
  'Wariyapola': { lat: 7.9667, lng: 80.2000 },
  
  // Puttalam District
  'Puttalam': { lat: 8.0362, lng: 79.8283 },
  'Chilaw': { lat: 7.5756, lng: 79.7953 },
  'Anamaduwa': { lat: 8.0167, lng: 79.9000 },
};

/**
 * Get coordinates for a specific location
 * Falls back to district center if location not found
 */
export const getLocationCoordinates = (
  location: string, 
  district: string
): { lat: number; lng: number } | null => {
  // Try to get location-specific coordinates first
  if (location && LOCATION_COORDINATES[location]) {
    return LOCATION_COORDINATES[location];
  }
  
  // Fallback to district center coordinates
  return getDistrictCoordinates(district);
};

/**
 * Get district center coordinates (fallback)
 */
export const getDistrictCoordinates = (district: string): { lat: number; lng: number } | null => {
  const districtCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
    'Monaragala': { lat: 6.8728, lng: 81.3507 },
    'Badulla': { lat: 6.9934, lng: 81.0550 },
    'Ampara': { lat: 7.2914, lng: 81.6747 },
    'Hambantota': { lat: 6.1429, lng: 81.1212 },
    'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
    'Kurunegala': { lat: 7.4867, lng: 80.3647 },
    'Puttalam': { lat: 8.0362, lng: 79.8283 },
  };
  
  return districtCoordinates[district] || null;
};
