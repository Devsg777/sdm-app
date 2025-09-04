import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { sendOTPViaWhatsapp, formatPhoneNumber } from '@/utils/smsService';
import { UserRole } from '@/types';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

// Initialize WebBrowser for Google Auth
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  userInfo: any;
  session: Session | null;
  loading: boolean;
  isPhoneVerified: boolean;
  authError: string | null;
  selectedRole: UserRole;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPhoneVerification: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneForGoogleUser: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  clearAuthError: () => void;
  setSelectedRole: (role: UserRole) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<any>({});
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // Replace with your actual client ID
    androidClientId: '225236139433-5s4qn78gh2cbrr615ergb0c6kjpnhf0n.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: '225236139433-mb0n0p9s0v5os0n6qu3kobvsvg71f00r.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: Constants.manifest?.scheme || 'com.sdm.cabapp'
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    try {
      setLoading(true);
      
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Sign in with OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_token: accessToken,
          },
        }
      });

      if (error) throw error;
      
      // Auth state listener will handle the rest
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setAuthError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        // Clear any timeouts since we got an auth event
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
        
        // Clear previous errors
        setAuthError(null);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(session);
          setUser(session?.user || null);
          setIsPhoneVerified(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Handle user session synchronously to avoid deadlocks
          setSession(session);
          setUser(session.user);
          
          // Defer database operations
          setTimeout(() => {
            if (mounted) {
              handleUserSession(session).catch((error) => {
                console.error('Error in deferred session handling:', error);
                if (mounted) {
                  setAuthError('Failed to verify user session');
                  setLoading(false);
                }
              });
            }
          }, 0);
        }
      }
    );

    // THEN initialize auth
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthError('Failed to initialize authentication');
            setLoading(false);
          }
          return;
        }

        if (currentSession?.user && mounted) {
          // Session exists, let the auth state change handler deal with it
          // Just set loading to false here since handler will be called
          setLoading(false);
        } else if (mounted) {
          // No session - user is not logged in
          setSession(null);
          setUser(null);
          setIsPhoneVerified(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthError('Authentication initialization failed');
          setLoading(false);
        }
      }
    };

    // Set timeout for auth initialization
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout - no auth events received');
        setLoading(false);
      }
    }, 5000); // Reduced to 5 seconds

    initializeAuth();

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (session: Session) => {
    try {
      // Check if user exists in database and sync if necessary
      const userSyncResult = await ensureUserInDatabase(session.user);
      
      if (!userSyncResult.success) {
        console.error('Failed to sync user with database:', userSyncResult.error);
        await handleUserSyncFailure(userSyncResult.error);
        return;
      }

      // Check phone verification status
      await checkPhoneVerificationStatus(session.user);
      setLoading(false);
    } catch (error) {
      console.error('Error handling user session:', error);
      setAuthError('Failed to verify user session');
      setLoading(false);
    }
  };

  const ensureUserInDatabase = async (user: User): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, phone_verified, phone_no, role')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user existence:', fetchError);
        return { success: false, error: 'Database query failed' };
      }

      if (!existingUser) {
        // User doesn't exist in database, create them
        console.log('User not found in database, creating user record');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            role: selectedRole || 'customer', // Use selected role or default to customer
            email: user.email,
            phone_no: user.phone || null,
            phone_verified: user.phone_confirmed_at ? true : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating user record:', insertError);
          return { success: false, error: 'Failed to create user record' };
        }

        console.log('User record created successfully');
      } else if (selectedRole && existingUser.role !== selectedRole) {
        // Update role if it's different from the selected role
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: selectedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user role:', updateError);
          return { success: false, error: 'Failed to update user role' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error ensuring user in database:', error);
      return { success: false, error: 'Unexpected error during user sync' };
    }
  };

  const handleUserSyncFailure = async (error?: string) => {
    try {
      console.log('Handling user sync failure - signing out user');
      setAuthError(`Your account needs to be re-verified: ${error || 'Database sync failed'}. Please sign in again.`);
      
      // Sign out the user
      await supabase.auth.signOut();
      
      // Reset all state
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      setLoading(false);
    } catch (signOutError) {
      console.error('Error during user sync failure handling:', signOutError);
      // Force reset state even if signOut fails
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      setLoading(false);
    }
  };

  const checkPhoneVerificationStatus = async (user: User) => {
    try {
      // First, always check our custom users table for verification status
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        // If user has already verified phone in our database, use that status
        if (data.phone_verified) {
          setIsPhoneVerified(true);
          // Update selected role from database if available
          if (data.role) {
            setSelectedRole(data.role as UserRole);
            setUserRole(data.role as UserRole);
            setUserInfo(data);
          }
          return;
        }
      }
      
      // If not verified in our database, check Supabase Auth for phone confirmation
      const hasVerifiedPhone = user.phone && user.phone_confirmed_at;
      
      if (hasVerifiedPhone) {
        setIsPhoneVerified(true);
        // Sync the verification status to our users table
        await updateUserPhoneStatus(user.id, user.phone!, true);
      } else {
        // No phone verification found anywhere
        setIsPhoneVerified(false);
      }
    } catch (error) {
      console.error('Error checking phone verification status:', error);
      setIsPhoneVerified(false);
    }
  };

  const updateUserPhoneStatus = async (userId: string, phone: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          phone_no: phone,
          phone_verified: verified,
          updated_at: new Date().toISOString()
        }).eq('id', userId);
      
      if (error) {
        console.error('Error updating user phone status:', error);
      }
    } catch (error) {
      console.error('Error updating user phone status:', error);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setAuthError(null);
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Sending OTP to:', formattedPhone);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        throw new Error(error.message);
      }

      console.log('OTP sent successfully:', data);
      return { success: true };
    } catch (error: any) {
      console.error('signInWithPhone error:', error);
      setAuthError(error.message || 'Failed to send OTP');
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  };

  const verifyPhoneOTP = async (phone: string, otp: string) => {
    try {
      setAuthError(null);
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Verifying OTP for:', formattedPhone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms'
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('OTP verified successfully, user signed in');
        // User will be synced via the auth state change listener
        return { success: true };
      }

      return { success: false, error: 'Verification failed' };
    } catch (error: any) {
      console.error('verifyPhoneOTP error:', error);
      setAuthError(error.message || 'Failed to verify OTP');
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      
      if (!request) {
        throw new Error('Google authentication request not initialized');
      }
      
      const result = await promptAsync();
      
      if (result.type !== 'success') {
        throw new Error('Google sign in was cancelled or failed');
      }
      
      return { success: true };
    } catch (error: any) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  const sendPhoneVerification = async (phone: string) => {
    try {
      setAuthError(null);
      if (!user) {
        throw new Error('No user logged in');
      }

      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to send OTP to:', formattedPhone);
      
      // Create phone verification using your custom database function
      const { data, error } = await supabase.rpc('create_phone_verification', {
        p_phone_number: formattedPhone
      });

      if (error) {
        console.error('Error creating phone verification:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to generate OTP - no data returned');
      }

      const otpCode = data[0]?.otp_code;
      if (!otpCode) {
        throw new Error('Failed to generate OTP - missing OTP code');
      }

      console.log('OTP generated successfully for', formattedPhone);
      
      // Send WhatsApp with OTP
      const whatsAppResult = await sendOTPViaWhatsapp(formattedPhone, otpCode);
      if (!whatsAppResult.success) {
        console.error('WhatsApp sending failed:', whatsAppResult.error);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('sendPhoneVerification error:', error);
      setAuthError(error.message || 'Failed to send verification code');
      return { success: false, error: error.message || 'Failed to send verification code' };
    }
  };

  const verifyPhoneForGoogleUser = async (phone: string, otp: string) => {
    try {
      setAuthError(null);
      if (!user) {
        throw new Error('No user logged in');
      }

      const formattedPhone = formatPhoneNumber(phone);
      const trimmedOtp = otp.trim();
      
      console.log('Attempting to verify OTP for:', formattedPhone);
      
      // Verify OTP using your custom database function
      const { data: isValid, error } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: formattedPhone,
        p_otp_code: trimmedOtp
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error(`Verification failed: ${error.message}`);
      }
      
      if (!isValid) {
        console.log('OTP verification failed: Invalid or expired code');
        return { 
          success: false, 
          error: 'Invalid or expired OTP. Please check the code and try again.' 
        };
      }

      console.log('OTP verified successfully for Google user');
      
      // Update the user's phone verification status
      await updateUserPhoneStatus(user.id, formattedPhone, true);
      
      // Update Supabase Auth user profile
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          phone: formattedPhone
        });

        if (updateError) {
          console.warn('Could not update user profile with phone:', updateError);
        }
      } catch (profileUpdateError) {
        console.warn('Profile update failed:', profileUpdateError);
      }

      setIsPhoneVerified(true);
      return { success: true };
    } catch (error: any) {
      console.error('verifyPhoneForGoogleUser error:', error);
      setAuthError(error.message || 'Failed to verify phone number');
      return { success: false, error: error.message || 'Failed to verify phone number' };
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      
      // First update local state immediately
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      setUserInfo({});
      
      // Then call signOut (this will trigger auth state change)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw here, just log - state is already cleared
      }
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // State is already cleared above
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isPhoneVerified,
    authError,
    selectedRole,
    signInWithPhone,
    verifyPhoneOTP,
    signInWithGoogle,
    signOut,
    sendPhoneVerification,
    verifyPhoneForGoogleUser,
    clearAuthError,
    setSelectedRole,
    userRole,
    setUserRole,
    userInfo,
    setUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};