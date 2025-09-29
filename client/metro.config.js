const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// tell nativewind where your global CSS is
module.exports = withNativeWind(config, { input: "./global.css" });
