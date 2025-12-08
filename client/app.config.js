import "dotenv/config";

export default {
  expo: {
    extra: {
      API_BASE: process.env.EXPO_PUBLIC_API_BASE,
    },
  },
};
