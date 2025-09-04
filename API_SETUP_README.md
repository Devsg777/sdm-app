# API Setup Guide for Cab Booking App

## 🚨 Important: API Keys Required

Your app needs API keys to function properly. Without them, Google Places autocomplete and maps won't work, and Razorpay payments will fail.

## 🔧 Setup Instructions

### 1. Create Environment File

Create a `.env` file in the project root (same level as `package.json`):

```bash
cp .env.example .env
```

### 2. Get API Keys

#### Google Places & Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Places API**
   - **Maps SDK for Android/iOS**
   - **Geocoding API**
4. Create credentials (API Key)
5. **Important**: Restrict the API key to your app:
   - Go to Credentials → Select your API key
   - Add restrictions:
     - **Application restrictions**: Android apps / iOS apps
     - **API restrictions**: Enable Places API, Maps SDK, Geocoding API

#### Razorpay API
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate API Key ID
4. Copy the **Key ID** (not the secret key)

### 3. Configure Environment Variables

Edit your `.env` file:

```env
# Google APIs
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyD_your_actual_places_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD_your_actual_maps_api_key_here

# Razorpay
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# Optional: Supabase (if using)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🐛 Debugging

### Test Your Setup

1. **Run the debug screen**: Navigate to `/debug` in your app
2. **Check API status**: The debug screen shows which APIs are configured
3. **Test components**: Use the debug screen to test each feature

### Common Issues

#### ❌ Google Places Not Working
- **Check**: API key is set in `.env`
- **Check**: Places API is enabled in Google Cloud Console
- **Check**: API key restrictions allow your app
- **Check**: Billing is enabled on Google Cloud (required for Places API)

#### ❌ Maps Not Displaying
- **Check**: Maps SDK is enabled for your platform (Android/iOS)
- **Check**: API key restrictions include Maps SDK
- **Check**: Correct bundle identifier/package name in restrictions

#### ❌ Razorpay Payment Error
- **Check**: Using **Key ID** (not secret key) in `.env`
- **Check**: Razorpay account is in test mode for development
- **Check**: Network connection (Razorpay requires internet)

### Debug Logs

Check your console/terminal for debug messages:
- `GooglePlacesInput Debug:` - Shows API key status and configuration
- `LiveMapTracking Debug:` - Shows map configuration and coordinates
- `Payment Error:` - Shows Razorpay error details

## 📱 Testing Checklist

- [ ] `.env` file exists with correct API keys
- [ ] Google Places autocomplete shows suggestions
- [ ] Map displays with markers and route
- [ ] Razorpay payment modal opens
- [ ] Location coordinates are saved to database
- [ ] All API status shows "✅ Configured" in debug screen

## 🔄 After Setup

1. **Restart your app** after adding API keys
2. **Clear app data/cache** if issues persist
3. **Test on device** (simulator might have restrictions)

## 📞 Need Help?

If you're still having issues:
1. Check the debug screen for specific error messages
2. Verify API keys are correctly copied (no extra spaces)
3. Ensure billing is enabled on Google Cloud
4. Test with a simple payment amount first

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use restricted API keys in production
- Regularly rotate API keys
- Monitor API usage in respective dashboards