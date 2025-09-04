import { supabase } from '@/lib/supabase';
import { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';

/**
 * Authentication service for handling user authentication with Supabase
 */
export const AuthService = {
  /**
   * Sign up a new user with email and password
   * @param email User's email
   * @param password User's password
   * @param userData Additional user data to be stored in the users table
   * @returns AuthResponse
   */
  signUp: async (
    email: string,
    password: string,
    userData: {
      first_name: string;
      last_name: string;
      phone_no?: string;
      role: 'rider' | 'driver' | 'admin';
    }
  ): Promise<AuthResponse> => {
    // Sign up the user with Supabase Auth
    const authResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_no: userData.phone_no,
          role: userData.role,
        },
      },
    });

    // If sign up is successful, create a record in the users table
    if (authResponse.data.user) {
      const { error } = await supabase.from('users').insert({
        id: authResponse.data.user.id,
        role: userData.role,
        email: email,
        phone_no: userData.phone_no,
        phone_verified: false,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });

      // If the user is a rider, also create a record in the customers table
      if (userData.role === 'rider' && !error) {
        await supabase.from('customers').insert({
          id: authResponse.data.user.id,
          loyalty_points: 0,
        });
      }

      // If the user is a driver, also create a record in the drivers table
      if (userData.role === 'driver' && !error) {
        await supabase.from('drivers').insert({
          id: authResponse.data.user.id,
          license_number: 'PENDING', // This will be updated later during KYC
          joined_on: new Date().toISOString(),
          rating: 0,
          total_rides: 0,
          status: 'inactive',
          kyc_status: 'pending',
        });
      }
    }

    return authResponse;
  },

  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns AuthResponse
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Sign in a user with phone number and OTP
   * @param phone User's phone number
   * @param otp One-time password
   * @returns AuthResponse
   */
  signInWithPhone: async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Call the RPC function to verify the OTP
      const { data, error } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: phone,
        p_otp_code: otp,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  },

  /**
   * Request a one-time password for phone verification
   * @param phone User's phone number
   * @returns The OTP code or null if there was an error
   */
  requestOTP: async (phone: string): Promise<string | null> => {
    try {
      // Call the RPC function to create a phone verification
      const { data, error } = await supabase.rpc('create_phone_verification', {
        p_phone_number: phone,
      });

      if (error) throw error;
      return data[0].otp_code;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return null;
    }
  },

  /**
   * Sign out the current user
   * @returns void
   */
  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  /**
   * Get the current user
   * @returns User or null
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get the current session
   * @returns Session or null
   */
  getCurrentSession: async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Reset password for a user
   * @param email User's email
   * @returns AuthResponse
   */
  resetPassword: async (email: string): Promise<{ data: any, error: AuthError | null }> => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cab-booking://reset-password',
    });
  },

  /**
   * Update user password
   * @param password New password
   * @returns AuthResponse
   */
  updatePassword: async (password: string): Promise<AuthResponse> => {
    return await supabase.auth.updateUser({
      password,
    });
  },

  /**
   * Update user profile
   * @param userData User data to update
   * @returns AuthResponse
   */
  updateProfile: async (userData: {
    first_name?: string;
    last_name?: string;
    phone_no?: string;
    profile_image_url?: string;
  }): Promise<AuthResponse> => {
    // Update auth metadata
    const authResponse = await supabase.auth.updateUser({
      data: userData,
    });

    // If update is successful, also update the users table
    if (authResponse.data.user) {
      await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_no: userData.phone_no,
          profile_image_url: userData.profile_image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authResponse.data.user.id);
    }

    return authResponse;
  },

  /**
   * Verify if a user exists by email
   * @param email User's email
   * @returns boolean
   */
  checkUserExists: async (email: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    return !error && data !== null;
  },

  /**
   * Verify if a phone number is already registered
   * @param phone User's phone number
   * @returns boolean
   */
  checkPhoneExists: async (phone: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone_no', phone)
      .single();

    return !error && data !== null;
  },
};

export default AuthService;