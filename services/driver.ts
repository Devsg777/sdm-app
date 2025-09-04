import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { UserService } from './user';

type Driver = Database['public']['Tables']['drivers']['Row'];
type DriverVehicle = Database['public']['Tables']['driver_vehicles']['Row'];
type DriverLocation = Database['public']['Tables']['driver_locations']['Row'];
type DriverEarning = Database['public']['Tables']['driver_earnings']['Row'];

/**
 * Service for handling driver operations
 */
export const DriverService = {
  /**
   * Get driver profile by ID
   * @param driverId Driver ID
   * @returns Driver profile or null if not found
   */
  getDriverProfile: async (driverId: string): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting driver profile:', error);
      return null;
    }
  },

  /**
   * Get driver profile with user details
   * @param driverId Driver ID
   * @returns Driver profile with user details or null if not found
   */
  getDriverWithUserDetails: async (driverId: string): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          users:id (
            id,
            first_name,
            last_name,
            phone_no,
            email,
            profile_image_url
          )
        `)
        .eq('id', driverId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting driver with user details:', error);
      return null;
    }
  },

  /**
   * Update driver profile
   * @param driverId Driver ID
   * @param driverData Driver data to update
   * @returns Updated driver profile or null if there was an error
   */
  updateDriverProfile: async (
    driverId: string,
    driverData: {
      license_number?: string;
      license_document_url?: string;
      id_proof_document_url?: string;
      status?: string;
      kyc_status?: string;
    }
  ): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          ...driverData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId)
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
   * Get driver vehicles
   * @param driverId Driver ID
   * @returns Array of driver vehicles
   */
  getDriverVehicles: async (driverId: string): Promise<DriverVehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('driver_vehicles')
        .select('*')
        .eq('driver_id', driverId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting driver vehicles:', error);
      return [];
    }
  },

  /**
   * Add a vehicle for a driver
   * @param driverId Driver ID
   * @param vehicleData Vehicle data
   * @returns The created vehicle or null if there was an error
   */
  addDriverVehicle: async (
    driverId: string,
    vehicleData: {
      make: string;
      model: string;
      year: number;
      color: string;
      license_plate: string;
      vehicle_type: string;
      registration_document_url?: string;
      insurance_document_url?: string;
      is_active?: boolean;
    }
  ): Promise<DriverVehicle | null> => {
    try {
      const { data, error } = await supabase
        .from('driver_vehicles')
        .insert({
          driver_id: driverId,
          ...vehicleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding driver vehicle:', error);
      return null;
    }
  },

  /**
   * Update a driver vehicle
   * @param vehicleId Vehicle ID
   * @param vehicleData Vehicle data to update
   * @returns The updated vehicle or null if there was an error
   */
  updateDriverVehicle: async (
    vehicleId: string,
    vehicleData: {
      make?: string;
      model?: string;
      year?: number;
      color?: string;
      license_plate?: string;
      vehicle_type?: string;
      registration_document_url?: string;
      insurance_document_url?: string;
      is_active?: boolean;
    }
  ): Promise<DriverVehicle | null> => {
    try {
      const { data, error } = await supabase
        .from('driver_vehicles')
        .update({
          ...vehicleData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vehicleId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating driver vehicle:', error);
      return null;
    }
  },

  /**
   * Delete a driver vehicle
   * @param vehicleId Vehicle ID
   * @returns boolean indicating success
   */
  deleteDriverVehicle: async (vehicleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('driver_vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting driver vehicle:', error);
      return false;
    }
  },

  /**
   * Update driver location
   * @param driverId Driver ID
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns The updated location or null if there was an error
   */
  updateDriverLocation: async (
    driverId: string,
    latitude: number,
    longitude: number
  ): Promise<DriverLocation | null> => {
    try {
      // Check if driver location exists
      const { data: existingLocation, error: checkError } = await supabase
        .from('driver_locations')
        .select('id')
        .eq('driver_id', driverId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingLocation) {
        // Update existing location
        const { data, error } = await supabase
          .from('driver_locations')
          .update({
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('driver_id', driverId)
          .select('*')
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new location
        const { data, error } = await supabase
          .from('driver_locations')
          .insert({
            driver_id: driverId,
            latitude,
            longitude,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
      return null;
    }
  },

  /**
   * Get nearby drivers
   * @param latitude Latitude
   * @param longitude Longitude
   * @param radius Radius in kilometers
   * @returns Array of nearby drivers
   */
  getNearbyDrivers: async (
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<any[]> => {
    try {
      // This would typically be a PostGIS query using ST_DWithin
      // For simplicity, we'll use a function that calculates distance
      const { data, error } = await supabase.rpc('get_nearby_drivers', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius: radius,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      return [];
    }
  },

  /**
   * Get driver earnings
   * @param driverId Driver ID
   * @param startDate Start date (optional)
   * @param endDate End date (optional)
   * @returns Array of driver earnings
   */
  getDriverEarnings: async (
    driverId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DriverEarning[]> => {
    try {
      let query = supabase
        .from('driver_earnings')
        .select('*')
        .eq('driver_id', driverId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting driver earnings:', error);
      return [];
    }
  },

  /**
   * Get driver earnings summary
   * @param driverId Driver ID
   * @param period Period ('day', 'week', 'month', 'year')
   * @returns Earnings summary
   */
  getDriverEarningsSummary: async (
    driverId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<{
    total: number;
    rides: number;
    average: number;
    period: string;
  }> => {
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          const day = now.getDay();
          startDate = new Date(now.setDate(now.getDate() - day));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      // Get earnings for the period
      const { data, error } = await supabase
        .from('driver_earnings')
        .select('amount')
        .eq('driver_id', driverId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Calculate summary
      const total = data.reduce((sum, item) => sum + item.amount, 0);
      const rides = data.length;
      const average = rides > 0 ? total / rides : 0;

      return {
        total,
        rides,
        average,
        period,
      };
    } catch (error) {
      console.error('Error getting driver earnings summary:', error);
      return {
        total: 0,
        rides: 0,
        average: 0,
        period,
      };
    }
  },

  /**
   * Update driver availability
   * @param driverId Driver ID
   * @param isAvailable Whether the driver is available
   * @returns boolean indicating success
   */
  updateDriverAvailability: async (
    driverId: string,
    isAvailable: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating driver availability:', error);
      return false;
    }
  },

  /**
   * Get driver ratings
   * @param driverId Driver ID
   * @returns Array of driver ratings
   */
  getDriverRatings: async (driverId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          bookings:booking_id (
            id,
            pickup_address,
            dropoff_address,
            service_type,
            fare_amount
          ),
          users:user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting driver ratings:', error);
      return [];
    }
  },

  /**
   * Get driver average rating
   * @param driverId Driver ID
   * @returns Average rating
   */
  getDriverAverageRating: async (driverId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('driver_id', driverId);

      if (error) throw error;

      if (data.length === 0) {
        return 0;
      }

      const sum = data.reduce((total, item) => total + item.rating, 0);
      return sum / data.length;
    } catch (error) {
      console.error('Error getting driver average rating:', error);
      return 0;
    }
  },

  /**
   * Upload driver document
   * @param driverId Driver ID
   * @param file File to upload
   * @param documentType Type of document (license, id_proof)
   * @returns URL of the uploaded document or null if there was an error
   */
  uploadDriverDocument: async (
    driverId: string,
    file: File,
    documentType: 'license' | 'id_proof'
  ): Promise<string | null> => {
    try {
      return await UserService.uploadDocument(driverId, file, documentType);
    } catch (error) {
      console.error('Error uploading driver document:', error);
      return null;
    }
  },

  /**
   * Complete driver KYC
   * @param driverId Driver ID
   * @param kycData KYC data
   * @returns boolean indicating success
   */
  completeDriverKYC: async (
    driverId: string,
    kycData: {
      license_number: string;
      license_document_url: string;
      id_proof_document_url: string;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          license_number: kycData.license_number,
          license_document_url: kycData.license_document_url,
          id_proof_document_url: kycData.id_proof_document_url,
          kyc_status: 'submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing driver KYC:', error);
      return false;
    }
  },
};

export default DriverService;