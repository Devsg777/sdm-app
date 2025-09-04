import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Booking, Driver, Vehicle, User, Payment, Location, ServiceType, VehicleType } from '@/types';

// Type helpers
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type BookingRow = Tables<'bookings'>;
type DriverRow = Tables<'drivers'>;
type VehicleRow = Tables<'vehicles'>;
type UserRow = Tables<'users'>;
type PaymentRow = Tables<'payments'>;
type LocationRow = Tables<'locations'>;
type ServiceTypeRow = Tables<'service_types'>;
type VehicleTypeRow = Tables<'vehicle_types'>;

// Booking Services
export const bookingService = {
  // Create a new booking
  async createBooking(bookingData: Partial<BookingRow>): Promise<{ data: BookingRow | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    return { data, error };
  },

  // Get booking by ID
  async getBooking(id: string): Promise<{ data: BookingRow | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(*),
        driver:drivers(*),
        vehicle:vehicles(*),
        service_type:service_types(*),
        pickup_location:locations(*),
        dropoff_location:locations(*)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Get user bookings
  async getUserBookings(userId: string, status?: string): Promise<{ data: BookingRow[] | null; error: any }> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users(*),
        driver:drivers(*),
        vehicle:vehicles(*),
        service_type:service_types(*),
        pickup_location:locations(*),
        dropoff_location:locations(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Update booking status
  async updateBookingStatus(id: string, status: string, additionalData?: Partial<BookingRow>): Promise<{ data: BookingRow | null; error: any }> {
    const updateData = { status, updated_at: new Date().toISOString(), ...additionalData };

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Assign driver to booking
  async assignDriver(bookingId: string, driverId: string): Promise<{ data: BookingRow | null; error: any }> {
    return this.updateBookingStatus(bookingId, 'assigned', {
      driver_id: driverId,
      status: 'assigned'
    });
  },

  // Get active bookings for driver
  async getDriverBookings(driverId: string): Promise<{ data: BookingRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service_type:service_types(*),
        pickup_location:locations(*),
        dropoff_location:locations(*)
      `)
      .eq('driver_id', driverId)
      .in('status', ['assigned', 'in_progress'])
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// Driver Services
export const driverService = {
  // Get driver profile
  async getDriverProfile(id: string): Promise<{ data: DriverRow | null; error: any }> {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Update driver location
  async updateDriverLocation(driverId: string, latitude: number, longitude: number): Promise<{ data: DriverRow | null; error: any }> {
    const { data, error } = await supabase
      .from('drivers')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', driverId)
      .select()
      .single();

    return { data, error };
  },

  // Update driver status
  async updateDriverStatus(driverId: string, status: string): Promise<{ data: DriverRow | null; error: any }> {
    const { data, error } = await supabase
      .from('drivers')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', driverId)
      .select()
      .single();

    return { data, error };
  },

  // Get available drivers near location
  async getNearbyDrivers(latitude: number, longitude: number, radiusKm: number = 5): Promise<{ data: DriverRow[] | null; error: any }> {
    // Note: This would require a more complex query with PostGIS or similar
    // For now, we'll get all active drivers
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(*)
      `)
      .eq('status', 'active')
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    return { data, error };
  }
};

// Vehicle Services
export const vehicleService = {
  // Get vehicle by ID
  async getVehicle(id: string): Promise<{ data: VehicleRow | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_type:vehicle_types(*)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Get available vehicles
  async getAvailableVehicles(): Promise<{ data: VehicleRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_type:vehicle_types(*)
      `)
      .eq('status', 'active')
      .is('assigned_driver_id', null);

    return { data, error };
  },

  // Get vehicles by type
  async getVehiclesByType(vehicleTypeId: string): Promise<{ data: VehicleRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_type:vehicle_types(*)
      `)
      .eq('vehicle_type_id', vehicleTypeId)
      .eq('status', 'active');

    return { data, error };
  },

  // Assign vehicle to driver
  async assignVehicleToDriver(vehicleId: string, driverId: string): Promise<{ data: VehicleRow | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        assigned_driver_id: driverId,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .select()
      .single();

    return { data, error };
  }
};

// Payment Services
export const paymentService = {
  // Create payment record
  async createPayment(paymentData: Partial<PaymentRow>): Promise<{ data: PaymentRow | null; error: any }> {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    return { data, error };
  },

  // Get payment by ID
  async getPayment(id: string): Promise<{ data: PaymentRow | null; error: any }> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Get payments for booking
  async getBookingPayments(bookingId: string): Promise<{ data: PaymentRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Update payment status
  async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<{ data: PaymentRow | null; error: any }> {
    const updateData: Partial<PaymentRow> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Location Services
export const locationService = {
  // Create location
  async createLocation(locationData: Partial<LocationRow>): Promise<{ data: LocationRow | null; error: any }> {
    const { data, error } = await supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single();

    return { data, error };
  },

  // Get location by ID
  async getLocation(id: string): Promise<{ data: LocationRow | null; error: any }> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Search locations by name
  async searchLocations(query: string): Promise<{ data: LocationRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    return { data, error };
  }
};

// Service Type Services
export const serviceTypeService = {
  // Get all active service types
  async getActiveServiceTypes(): Promise<{ data: ServiceTypeRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    return { data, error };
  },

  // Get service type by ID
  async getServiceType(id: string): Promise<{ data: ServiceTypeRow | null; error: any }> {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }
};

// Vehicle Type Services
export const vehicleTypeService = {
  // Get all active vehicle types
  async getActiveVehicleTypes(): Promise<{ data: VehicleTypeRow[] | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    return { data, error };
  },

  // Get vehicle type by ID
  async getVehicleType(id: string): Promise<{ data: VehicleTypeRow | null; error: any }> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }
};

// User Services
export const userService = {
  // Get user profile
  async getUserProfile(id: string): Promise<{ data: UserRow | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Update user profile
  async updateUserProfile(id: string, updates: Partial<UserRow>): Promise<{ data: UserRow | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Get user saved locations
  async getUserSavedLocations(userId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('customer_saved_locations')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create saved location
  async createSavedLocation(locationData: any): Promise<{ data: any | null; error: any }> {
    const { data, error } = await supabase
      .from('customer_saved_locations')
      .insert(locationData)
      .select()
      .single();

    return { data, error };
  }
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to booking updates
  subscribeToBookingUpdates(bookingId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`booking-${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to driver location updates
  subscribeToDriverLocation(driverId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`driver-${driverId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'drivers',
        filter: `id=eq.${driverId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to user bookings
  subscribeToUserBookings(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-bookings-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};