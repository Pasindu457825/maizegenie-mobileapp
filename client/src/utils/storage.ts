import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  FORM_DATA: '@corn_forecast_form_data',
  AUTO_DATA: '@corn_forecast_auto_data',
  LOCATION_DATA: '@corn_forecast_location',
  WEATHER_DATA: '@corn_forecast_weather',
  PRICE_DATA: '@corn_forecast_price',
};

// Save form data
export const saveFormData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.FORM_DATA, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving form data:', error);
    return false;
  }
};

// Get form data
export const getFormData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FORM_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting form data:', error);
    return null;
  }
};

// Save auto-captured system data
export const saveAutoData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_DATA, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving auto data:', error);
    return false;
  }
};

// Get auto-captured system data
export const getAutoData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting auto data:', error);
    return null;
  }
};

// Save location data
export const saveLocationData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_DATA, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving location data:', error);
    return false;
  }
};

// Get location data
export const getLocationData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting location data:', error);
    return null;
  }
};

// Save weather data
export const saveWeatherData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_DATA, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving weather data:', error);
    return false;
  }
};

// Get weather data
export const getWeatherData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting weather data:', error);
    return null;
  }
};

// Save price data (fuel, import tax, farm gate price)
export const savePriceData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.PRICE_DATA, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving price data:', error);
    return false;
  }
};

// Get price data
export const getPriceData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PRICE_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting price data:', error);
    return null;
  }
};

// Clear specific storage key
export const clearStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Clear all app storage
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing all storage:', error);
    return false;
  }
};