import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Location, Vehicle } from '@/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Service for handling booking operations
 */
export const BookingService = {
  /**
   * Create a new booking
   * @param bookingData Booking data
   * @returns The created booking or null if there was an error
   */
  createBooking: async (bookingData: BookingInsert): Promise<Booking | null> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  },

  /**
   * Get a booking by ID
   * @param bookingId Booking ID
   * @returns The booking or null if not found
   */
  getBookingById: async (bookingId: string): Promise<Booking | null> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  },

  /**
   * Get all bookings for a user
   * @param userId User ID
   * @returns Array of bookings
   */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  },

  /**
   * Get active bookings for a user (pending, accepted, arriving, arrived, in_progress)
   * @param userId User ID
   * @returns Array of active bookings
   */
  getActiveBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active bookings:', error);
      return [];
    }
  },

  /**
   * Get completed bookings for a user
   * @param userId User ID
   * @returns Array of completed bookings
   */
  getCompletedBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting completed bookings:', error);
      return [];
    }
  },

  /**
   * Update a booking
   * @param bookingId Booking ID
   * @param bookingData Booking data to update
   * @returns The updated booking or null if there was an error
   */
  updateBooking: async (bookingId: string, bookingData: BookingUpdate): Promise<Booking | null> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', bookingId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      return null;
    }
  },

  /**
   * Cancel a booking
   * @param bookingId Booking ID
   * @param reason Cancellation reason
   * @returns The cancelled booking or null if there was an error
   */
  cancelBooking: async (bookingId: string, reason: string): Promise<Booking | null> => {
    try {
      // Update the booking status
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select('*')
        .single();

      if (error) throw error;

      // Create a cancellation record
      if (data) {
        await supabase.from('booking_cancellations').insert({
          booking_id: bookingId,
          user_id: data.user_id,
          reason: reason,
        });
      }

      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return null;
    }
  },

  /**
   * Rate a completed booking
   * @param bookingId Booking ID
   * @param userId User ID
   * @param driverId Driver ID
   * @param rating Rating (1-5)
   * @param review Optional review text
   * @returns boolean indicating success
   */
  rateBooking: async (
    bookingId: string,
    userId: string,
    driverId: string,
    rating: number,
    review?: string
  ): Promise<boolean> => {
    try {
      // Create a rating record
      const { error } = await supabase.from('ratings').insert({
        booking_id: bookingId,
        user_id: userId,
        driver_id: driverId,
        rating: rating,
        review: review,
      });

      if (error) throw error;

      // Update the driver's average rating
      await updateDriverRating(driverId);

      return true;
    } catch (error) {
      console.error('Error rating booking:', error);
      return false;
    }
  },

  /**
   * Calculate fare for a booking
   * @param serviceType Service type (city, airport, outstation, hourly)
   * @param distance Distance in kilometers
   * @param duration Duration in minutes
   * @param vehicleType Vehicle type (sedan, suv, premium)
   * @returns Fare details
   */
  calculateFare: async (
    serviceType: string,
    distance: number,
    duration: number,
    vehicleType: string
  ): Promise<{
    base: number;
    distance: number;
    time: number;
    surge: number;
    tax: number;
    total: number;
    advancePayment: number;
    remainingPayment: number;
  } | null> => {
    try {
      // Get service type details
      const { data: serviceTypeData, error: serviceTypeError } = await supabase
        .from('service_types')
        .select('*')
        .eq('service_code', serviceType)
        .single();

      if (serviceTypeError) throw serviceTypeError;

      // Base fare calculation
      let baseFare = serviceTypeData.base_fare;
      
      // Apply vehicle type multiplier
      let vehicleMultiplier = 1.0;
      switch (vehicleType) {
        case 'sedan':
          vehicleMultiplier = 1.0;
          break;
        case 'suv':
          vehicleMultiplier = 1.5;
          break;
        case 'premium':
          vehicleMultiplier = 2.0;
          break;
        default:
          vehicleMultiplier = 1.0;
      }
      
      baseFare *= vehicleMultiplier;
      
      // Distance fare
      const distanceFare = distance * serviceTypeData.per_km_rate;
      
      // Time fare
      const timeFare = duration * serviceTypeData.per_minute_rate;
      
      // Surge calculation (mock for now)
      const surge = 0;
      
      // Subtotal
      const subtotal = baseFare + distanceFare + timeFare + surge;
      
      // Tax (10%)
      const tax = subtotal * 0.1;
      
      // Total
      const total = subtotal + tax;
      
      // Advance payment (25%)
      const advancePayment = total * 0.25;
      
      // Remaining payment
      const remainingPayment = total - advancePayment;
      
      return {
        base: Math.round(baseFare),
        distance: Math.round(distanceFare),
        time: Math.round(timeFare),
        surge,
        tax: Math.round(tax),
        total: Math.round(total),
        advancePayment: Math.round(advancePayment),
        remainingPayment: Math.round(remainingPayment),
      };
    } catch (error) {
      console.error('Error calculating fare:', error);
      return null;
    }
  },

  /**
   * Get available vehicles for a service type
   * @param serviceType Service type (city, airport, outstation, hourly)
   * @returns Array of available vehicles
   */
  getAvailableVehicles: async (serviceType: string): Promise<Vehicle[]> => {
    try {
      // In a real implementation, this would query the database for available vehicles
      // based on the service type, location, and availability
      
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Sedan',
          type: 'sedan',
          description: 'Comfortable and economical',
          passengers: 4,
          price: 450,
          estimatedTime: '5 min arrival',
          image: 'sedan',
          features: ['AC', 'GPS Tracking', 'Safe & Secure']
        },
        {
          id: '2',
          name: 'SUV',
          type: 'suv',
          description: 'Spacious for groups',
          passengers: 6,
          price: 300,
          estimatedTime: '7 min arrival',
          image: 'suv',
          features: ['AC', 'GPS Tracking', 'Extra Space']
        },
        {
          id: '3',
          name: 'Premium',
          type: 'premium',
          description: 'Luxury experience',
          passengers: 4,
          price: 700,
          estimatedTime: '10 min arrival',
          image: 'premium',
          features: ['AC', 'GPS Tracking', 'Luxury Interior']
        }
      ];
    } catch (error) {
      console.error('Error getting available vehicles:', error);
      return [];
    }
  },

  /**
   * Get popular locations
   * @returns Array of popular locations
   */
  getPopularLocations: async (): Promise<Location[]> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_popular', true)
        .limit(10);

      if (error) throw error;
      
      return data.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      })) || [];
    } catch (error) {
      console.error('Error getting popular locations:', error);
      return [];
    }
  },

  /**
   * Get saved locations for a user
   * @param userId User ID
   * @returns Array of saved locations
   */
  getSavedLocations: async (userId: string): Promise<any[]> => {
    try {
      // Try the saved_locations table first (preferred)
      const { data: savedLocations, error: savedError } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', userId);

      if (!savedError && savedLocations) {
        return savedLocations.map(location => ({
          id: location.id,
          name: location.title || location.address,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
      }

      // Fallback to customer_saved_locations table
      const { data: customerLocations, error: customerError } = await supabase
        .from('customer_saved_locations')
        .select('*')
        .eq('customer_id', userId);

      if (customerError) throw customerError;

      return customerLocations?.map(location => ({
        id: location.id,
        name: location.label,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      })) || [];
    } catch (error) {
      console.error('Error getting saved locations:', error);
      return [];
    }
  },

  /**
   * Save a location for a user
   * @param userId User ID
   * @param location Location to save
   * @returns The saved location or null if there was an error
   */
  saveLocation: async (
    userId: string,
    location: {
      label: string;
      address: string;
      latitude: number;
      longitude: number;
      is_default?: boolean;
    }
  ): Promise<any | null> => {
    try {
      // Try the saved_locations table first (preferred)
      const { data: savedData, error: savedError } = await supabase
        .from('saved_locations')
        .insert({
          user_id: userId,
          title: location.label,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          is_default: location.is_default || false,
        })
        .select('*')
        .single();

      if (!savedError && savedData) {
        return {
          id: savedData.id,
          name: savedData.title || savedData.address,
          address: savedData.address,
          latitude: savedData.latitude,
          longitude: savedData.longitude,
        };
      }

      // Fallback to customer_saved_locations table
      const { data: customerData, error: customerError } = await supabase
        .from('customer_saved_locations')
        .insert({
          customer_id: userId,
          label: location.label,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          is_default: location.is_default || false,
        })
        .select('*')
        .single();

      if (customerError) throw customerError;

      return {
        id: customerData.id,
        name: customerData.label,
        address: customerData.address,
        latitude: customerData.latitude,
        longitude: customerData.longitude,
      };
    } catch (error) {
      console.error('Error saving location:', error);
      return null;
    }
  },

  /**
   * Process payment for a booking
   * @param bookingId Booking ID
   * @param amount Payment amount
   * @param paymentMethod Payment method (card, upi, wallet)
   * @param isAdvance Whether this is an advance payment
   * @returns boolean indicating success
   */
  processPayment: async (
    bookingId: string,
    amount: number,
    paymentMethod: string,
    isAdvance: boolean = true
  ): Promise<boolean> => {
    try {
      // Create a payment record
      const { error } = await supabase.from('payments').insert({
        booking_id: bookingId,
        amount: amount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        is_advance: isAdvance,
        payment_gateway: 'razorpay',
        payment_gateway_response: { status: 'success' },
      });

      if (error) throw error;

      // Update the booking payment status
      const paymentStatus = isAdvance ? 'partial' : 'completed';
      await supabase
        .from('bookings')
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      return true;
    } catch (error) {
      console.error('Error processing payment:', error);
      return false;
    }
  },
};

/**
 * Helper function to update a driver's average rating
 * @param driverId Driver ID
 */
async function updateDriverRating(driverId: string): Promise<void> {
  try {
    // Get all ratings for the driver
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('driver_id', driverId);

    if (error) throw error;

    // Calculate average rating
    const ratings = data || [];
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    // Update the driver's rating
    await supabase
      .from('drivers')
      .update({
        rating: averageRating,
        total_rides: ratings.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', driverId);
  } catch (error) {
    console.error('Error updating driver rating:', error);
  }
}

export default BookingService;