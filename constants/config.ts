// API Configuration
export const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_PLACES_API_KEY';
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';

// Default coordinates for India
export const DEFAULT_LOCATION = {
  latitude: 28.6139, // Delhi coordinates
  longitude: 77.2090,
};

// Map configuration
export const MAP_CONFIG = {
  initialRegion: {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  provider: 'google' as const,
};

// Optional media configuration (set in app config or .env)
// Example: EXPO_PUBLIC_HERO_VIDEO_URL=https://cdn.example.com/ev-hero.mp4
//          EXPO_PUBLIC_HERO_IMAGE_URL=https://cdn.example.com/ev-hero.jpg
export const HERO_VIDEO_URL = process.env.EXPO_PUBLIC_HERO_VIDEO_URL || null;
export const HERO_IMAGE_URL = process.env.EXPO_PUBLIC_HERO_IMAGE_URL || null;