import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type Driver = Database['public']['Tables']['drivers']['Row'];

/**
 * Service for handling user operations
 */
export const UserService = {
  /**
   * Get user profile by ID
   * @param userId User ID
   * @returns User profile or null if not found
   */
  getUserProfile: async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  /**
   * Get customer profile by user ID
   * @param userId User ID
   * @returns Customer profile or null if not found
   */
  getCustomerProfile: async (userId: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting customer profile:', error);
      return null;
    }
  },

  /**
   * Get driver profile by user ID
   * @param userId User ID
   * @returns Driver profile or null if not found
   */
  getDriverProfile: async (userId: string): Promise<any | null> => {
   try {
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      // Explicitly specify the foreign key to use for the join.
      .select('*, vehicle_info:vehicles!vehicles_assigned_driver_id_fkey(*)')
      .eq('id', userId)
      .single();

    if (driverError) {
      console.error('Error fetching driver or vehicle data:', driverError.message);
      return null;
    }
    
    if (!driverData) {
      console.log('Driver not found:', userId);
      return null;
    }

    return driverData || null;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
  },

  /**
   * Update user profile
   * @param userId User ID
   * @param userData User data to update
   * @returns Updated user profile or null if there was an error
   */
  updateUserProfile: async (
    userId: string,
    userData: {
      first_name?: string;
      last_name?: string;
      phone_no?: string;
      profile_image_url?: string;
    }
  ): Promise<User | null> => {
    try {
      // Build the update object dynamically
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Handle full_name field (database uses full_name, not first_name/last_name)
      if (userData.first_name || userData.last_name) {
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        updateData.full_name = `${firstName} ${lastName}`.trim();
      }

      if (userData.phone_no !== undefined) {
        updateData.phone_no = userData.phone_no;
      }

      if (userData.profile_image_url !== undefined) {
        updateData.profile_picture_url = userData.profile_image_url;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  /**
   * Update customer profile
   * @param userId User ID
   * @param customerData Customer data to update
   * @returns Updated customer profile or null if there was an error
   */
  updateCustomerProfile: async (
    userId: string,
    customerData: {
      dob?: string;
      preferred_payment_method?: string;
    }
  ): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          dob: customerData.dob,
          preferred_payment_method: customerData.preferred_payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating customer profile:', error);
      return null;
    }
  },

  /**
   * Update driver profile
   * @param userId User ID
   * @param driverData Driver data to update
   * @returns Updated driver profile or null if there was an error
   */
  updateDriverProfile: async (
    userId: string,
    driverData: {
      license_number?: string;
      license_document_url?: string;
      id_proof_document_url?: string;
    }
  ): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          license_number: driverData.license_number,
          license_document_url: driverData.license_document_url,
          id_proof_document_url: driverData.id_proof_document_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating driver profile:', error);
      return null;
    }
  },

  /**
   * Upload a profile image
   * @param userId User ID
   * @param file File to upload
   * @returns URL of the uploaded image or null if there was an error
   */
  uploadProfileImage: async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      // Update user profile with the new image URL
      await supabase
        .from('users')
        .update({
          profile_image_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  },

  /**
   * Upload a document (license, ID proof, etc.)
   * @param userId User ID
   * @param file File to upload
   * @param documentType Type of document (license, id_proof)
   * @returns URL of the uploaded document or null if there was an error
   */
  uploadDocument: async (
    userId: string,
    file: File,
    documentType: 'license' | 'id_proof'
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${documentType}-${Math.random()}.${fileExt}`;
      const filePath = `driver-documents/${fileName}`;

      const { error } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      // Update driver profile with the new document URL
      if (documentType === 'license') {
        await supabase
          .from('drivers')
          .update({
            license_document_url: data.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } else if (documentType === 'id_proof') {
        await supabase
          .from('drivers')
          .update({
            id_proof_document_url: data.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  },

  /**
   * Get loyalty points for a customer
   * @param userId User ID
   * @returns Loyalty points or 0 if there was an error
   */
  getLoyaltyPoints: async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.loyalty_points || 0;
    } catch (error) {
      console.error('Error getting loyalty points:', error);
      return 0;
    }
  },

  /**
   * Add loyalty points for a customer
   * @param userId User ID
   * @param points Points to add
   * @returns Updated loyalty points or null if there was an error
   */
  addLoyaltyPoints: async (userId: string, points: number): Promise<number | null> => {
    try {
      // Get current loyalty points
      const { data: currentData, error: currentError } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      if (currentError) throw currentError;

      const currentPoints = currentData?.loyalty_points || 0;
      const newPoints = currentPoints + points;

      // Update loyalty points
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('loyalty_points')
        .single();

      if (error) throw error;
      return data?.loyalty_points || null;
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      return null;
    }
  },

  /**
   * Use loyalty points for a customer
   * @param userId User ID
   * @param points Points to use
   * @returns Updated loyalty points or null if there was an error
   */
  useLoyaltyPoints: async (userId: string, points: number): Promise<number | null> => {
    try {
      // Get current loyalty points
      const { data: currentData, error: currentError } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      if (currentError) throw currentError;

      const currentPoints = currentData?.loyalty_points || 0;
      
      // Check if customer has enough points
      if (currentPoints < points) {
        throw new Error('Not enough loyalty points');
      }
      
      const newPoints = currentPoints - points;

      // Update loyalty points
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('loyalty_points')
        .single();

      if (error) throw error;
      return data?.loyalty_points || null;
    } catch (error) {
      console.error('Error using loyalty points:', error);
      return null;
    }
  },

  /**
   * Get emergency contacts for a user
   * @param userId User ID
   * @returns Array of emergency contacts
   */
  getEmergencyContacts: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  },

  /**
   * Add an emergency contact for a user
   * @param userId User ID
   * @param contactName Contact name
   * @param contactNumber Contact phone number
   * @returns The created emergency contact or null if there was an error
   */
  addEmergencyContact: async (
    userId: string,
    contactName: string,
    contactNumber: string
  ): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: userId,
          contact_name: contactName,
          contact_number: contactNumber,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      return null;
    }
  },

  /**
   * Delete an emergency contact
   * @param contactId Contact ID
   * @returns boolean indicating success
   */
  deleteEmergencyContact: async (contactId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      return false;
    }
  },
};

export default UserService;