# Supabase Authentication Integration for SDM Cab Booking App

This document provides an overview of the Supabase authentication integration for the SDM Cab Booking mobile application.

## Overview

The authentication system has been implemented to match the SDM_Website web application, providing a consistent user experience across platforms. The system supports:

- Phone number authentication with OTP verification
- Google OAuth authentication
- Role-based access (rider/driver)
- Session persistence
- Phone verification for all users

## Implementation Details

### Files Created/Modified

1. **Supabase Client**
   - `lib/supabase.ts` - Configures the Supabase client with proper mobile settings

2. **Authentication Context**
   - `contexts/AuthContext.tsx` - Provides authentication state and methods to the entire app

3. **SMS Service**
   - `utils/smsService.ts` - Handles OTP delivery via WhatsApp

4. **UI Integration**
   - Modified `app/(auth)/login.tsx` to use the new authentication system
   - Updated `app/_layout.tsx` to include the AuthProvider
   - Updated `app/index.tsx` to handle authentication state

5. **Dependencies**
   - Added Supabase and related dependencies to `package.json`

## Authentication Flow

### Phone Authentication
1. User selects role (rider/driver)
2. User enters phone number
3. OTP is sent via Supabase Auth and WhatsApp
4. User enters OTP for verification
5. Upon successful verification, user is redirected to the appropriate dashboard

### Google Authentication
1. User selects role (rider/driver)
2. User clicks "Continue with Google"
3. Google OAuth flow is initiated
4. After successful Google authentication, user is prompted to verify phone number
5. OTP is sent via WhatsApp
6. User enters OTP for verification
7. Upon successful verification, user is redirected to the appropriate dashboard

## Role-Based Access

The system supports two roles:
- **Rider**: Regular customers who book rides
- **Driver**: Drivers who accept and fulfill ride requests

The role is selected at the beginning of the authentication flow and stored in the Supabase database.

## Session Management

- Sessions are persisted using AsyncStorage
- Auto-refresh of tokens is enabled
- Session state is managed through the AuthContext

## Error Handling

- Comprehensive error handling for all authentication operations
- User-friendly error messages
- Automatic retry mechanisms for certain operations

## Security Considerations

- OTP codes expire after 10 minutes
- Phone verification is required for all users
- Secure storage of authentication tokens
- Protection against brute force attacks via rate limiting

## Usage in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user,                    // Current user object
    isPhoneVerified,         // Phone verification status
    selectedRole,            // Selected role (rider/driver)
    signInWithPhone,         // Phone authentication
    verifyPhoneOTP,          // OTP verification
    signInWithGoogle,        // Google authentication
    signOut,                 // Sign out
    loading,                 // Loading state
    authError                // Authentication error
  } = useAuth();

  // Component logic
}
```

## Installation

After cloning the repository, install the dependencies:

```bash
npm install
```

### Package Versions

The following package versions are compatible with Expo SDK 53:

```json
"@supabase/supabase-js": "^2.39.7",
"expo-auth-session": "~6.1.4",
"expo-crypto": "~14.1.3",
"expo-web-browser": "~14.2.0",
"react-native-url-polyfill": "^2.0.0"
```

If you encounter version compatibility issues, make sure these versions match your package.json.

## Configuration

Update the Google OAuth client IDs in `contexts/AuthContext.tsx` with your actual client IDs:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_EXPO_CLIENT_ID',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  webClientId: 'YOUR_WEB_CLIENT_ID',
  redirectUri: makeRedirectUri({
    scheme: Constants.manifest?.scheme || 'com.sdm.cabapp'
  }),
});
```