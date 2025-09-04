import { BookingType, Location, Ride, RideStatus, TripType, Vehicle } from '@/types';
import { create } from 'zustand';
import { bookingService, vehicleService, userService } from '@/services/supabase';

type RideState = {
  currentRide: Partial<Ride> | null;
  selectedVehicle: Vehicle | null;
  rides: Ride[];
  pastRides: Ride[];
  loading: boolean;
  error: string | null;
  setBookingType: (type: BookingType) => void;
  setTripType: (type: TripType) => void;
  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
  setDateTime: (date: string, time: string) => void;
  setPassengers: (count: number) => void;
  setHours: (hours: string) => void;
  setVehicle: (vehicle: Vehicle) => void;
  setPaymentMethod: (method: 'card' | 'upi' | string) => void;
  confirmBooking: (rating?: number, review?: string) => Promise<void>;
  completeRide: (rating?: number, review?: string) => Promise<void>;
  updateRideStatus: (rideId: string, status: string) => Promise<void>;
  loadUserRides: () => Promise<void>;
  resetRide: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useRideStore = create<RideState>((set, get) => ({
  currentRide: null,
  selectedVehicle: null,
  rides: [],
  pastRides: [],
  loading: false,
  error: null,

  setBookingType: (bookingType) =>
    set((state) => ({
      currentRide: { ...state.currentRide, bookingType }
    })),

  setTripType: (tripType) =>
    set((state) => ({
      currentRide: { ...state.currentRide, tripType }
    })),

  setPickup: (pickup) =>
    set((state) => ({
      currentRide: { ...state.currentRide, pickup }
    })),

  setDropoff: (dropoff) =>
    set((state) => ({
      currentRide: { ...state.currentRide, dropoff }
    })),

  setDateTime: (date, time) =>
    set((state) => ({
      currentRide: { ...state.currentRide, date, time }
    })),

  setPassengers: (passengers) =>
    set((state) => ({
      currentRide: { ...state.currentRide, passengers }
    })),

  setHours: (hours) =>
    set((state) => ({
      currentRide: { ...state.currentRide, hours }
    })),

  setVehicle: (vehicle) =>
    set((state) => {
      const distance = 15; // Mock distance in km
      const duration = 25; // Mock duration in minutes
      const baseFare = vehicle.price || 50;
      const distanceFare = distance * 2;
      const timeFare = duration * 0.5;
      const surge = 0; // No surge for now
      const subtotal = baseFare + distanceFare + timeFare + surge;
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      return {
        selectedVehicle: vehicle,
        currentRide: {
          ...state.currentRide,
          vehicle,
          distance,
          duration,
          fare: {
            base: baseFare,
            distance: distanceFare,
            time: timeFare,
            surge,
            tax,
            total,
            advancePayment: total * 0.25,
            remainingPayment: total * 0.75,
          }
        }
      };
    }),

  setPaymentMethod: (paymentMethod) =>
    set((state) => ({
      currentRide: { ...state.currentRide, paymentMethod }
    })),

  confirmBooking: async (rating, review) => {
    const state = get();
    if (!state.currentRide) {
      console.log('No current ride to confirm');
      return;
    }

    set({ loading: true, error: null });

    try {
      // Create booking in database
      const bookingData = {
        user_id: state.currentRide.riderId || 'user1',
        pickup_address: state.currentRide.pickup?.address || '',
        dropoff_address: state.currentRide.dropoff?.address || '',
        pickup_latitude: state.currentRide.pickup?.latitude,
        pickup_longitude: state.currentRide.pickup?.longitude,
        dropoff_latitude: state.currentRide.dropoff?.latitude,
        dropoff_longitude: state.currentRide.dropoff?.longitude,
        fare_amount: state.currentRide.fare?.total,
        advance_amount: state.currentRide.fare?.advancePayment,
        remaining_amount: state.currentRide.fare?.remainingPayment,
        passengers: state.currentRide.passengers ?? 1,
        service_type: state.currentRide.bookingType || 'city',
        trip_type: state.currentRide.tripType || 'one-way',
        scheduled_time: state.currentRide.date && state.currentRide.time
          ? new Date(`${state.currentRide.date}T${state.currentRide.time}`).toISOString()
          : undefined,
        special_instructions: state.currentRide.special_instructions,
        status: 'pending',
        payment_status: 'pending',
        is_scheduled: !!(state.currentRide.date && state.currentRide.time)
      };

      const { data: booking, error } = await bookingService.createBooking(bookingData);

      if (error) throw error;

      if (!booking) throw new Error('Booking creation failed');

      const confirmedRide: Ride = {
        ...state.currentRide,
        id: booking.id,
        riderId: booking.user_id,
        status: booking.status as RideStatus,
        paymentStatus: booking.payment_status as any,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        pickup_address: booking.pickup_address || undefined,
        dropoff_address: booking.dropoff_address || undefined,
        fare_amount: booking.fare_amount || undefined,
        advance_amount: booking.advance_amount || undefined,
        remaining_amount: booking.remaining_amount || undefined,
        scheduled_time: booking.scheduled_time || undefined,
        special_instructions: booking.special_instructions || undefined,
        service_type: booking.service_type || undefined,
        tripType: (booking.trip_type as TripType) || 'one-way',
        bookingType: (booking.service_type as BookingType) || 'city',
        rating,
        review,
      };

      set((state) => ({
        rides: [...state.rides, confirmedRide],
        currentRide: confirmedRide,
        loading: false
      }));

    } catch (error: any) {
      console.error('Error confirming booking:', error);
      set({ error: error.message, loading: false });
    }
  },

  completeRide: async (rating, review) => {
    const state = get();
    if (!state.currentRide) return;

    set({ loading: true, error: null });

    try {
      // Update booking status in database
      const { error } = await bookingService.updateBookingStatus(
        state.currentRide.id!,
        'completed',
        {
          payment_status: 'completed'
        }
      );

      if (error) throw error;

      if (!state.currentRide.id) {
        throw new Error('No current ride ID found');
      }

      const completedRide: Ride = {
        ...state.currentRide,
        id: state.currentRide.id,
        status: 'completed',
        paymentStatus: 'completed',
        bookingType: state.currentRide.bookingType || 'city',
        tripType: state.currentRide.tripType || 'one-way',
        passengers: state.currentRide.passengers || 1,
        rating,
        review,
      };

      set((state) => ({
        rides: state.rides.map(ride =>
          ride.id === completedRide.id ? completedRide : ride
        ),
        pastRides: [...state.pastRides, completedRide],
        currentRide: null,
        loading: false
      }));

    } catch (error: any) {
      console.error('Error completing ride:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateRideStatus: async (rideId, status) => {
    set({ loading: true, error: null });

    try {
      const { error } = await bookingService.updateBookingStatus(rideId, status);

      if (error) throw error;

      set((state) => ({
        rides: state.rides.map(ride =>
          ride.id === rideId ? { ...ride, status: status as RideStatus } : ride
        ),
        loading: false
      }));

    } catch (error: any) {
      console.error('Error updating ride status:', error);
      set({ error: error.message, loading: false });
    }
  },

  loadUserRides: async () => {
    set({ loading: true, error: null });

    try {
      // This would need to get the current user ID from auth context
      // For now, we'll use a placeholder
      const userId = 'user1';

      const { data: bookings, error } = await bookingService.getUserBookings(userId);

      if (error) throw error;

      // Convert database bookings to Ride format
      const rides: Ride[] = (bookings || []).map(booking => ({
        id: booking.id,
        riderId: booking.user_id,
        driverId: booking.driver_id || undefined,
        bookingType: (booking.service_type as BookingType) || 'city',
        tripType: (booking.trip_type as TripType) || 'one-way',
        pickup: booking.pickup_latitude && booking.pickup_longitude ? {
          id: booking.pickup_location_id || 'pickup',
          name: 'Pickup Location',
          address: booking.pickup_address,
          latitude: booking.pickup_latitude,
          longitude: booking.pickup_longitude
        } : undefined,
        dropoff: booking.dropoff_latitude && booking.dropoff_longitude ? {
          id: booking.dropoff_location_id || 'dropoff',
          name: 'Dropoff Location',
          address: booking.dropoff_address,
          latitude: booking.dropoff_latitude,
          longitude: booking.dropoff_longitude
        } : undefined,
        date: booking.scheduled_time ? new Date(booking.scheduled_time).toISOString().split('T')[0] : undefined,
        time: booking.scheduled_time ? new Date(booking.scheduled_time).toLocaleTimeString('en-US', { hour12: false }) : undefined,
        passengers: booking.passengers,
        status: booking.status as RideStatus,
        paymentStatus: booking.payment_status as any,
        fare: booking.fare_amount ? {
          base: booking.fare_amount * 0.7, // Approximate breakdown
          distance: booking.fare_amount * 0.2,
          time: booking.fare_amount * 0.05,
          surge: 0,
          tax: booking.fare_amount * 0.05,
          total: booking.fare_amount,
          advancePayment: booking.advance_amount || 0,
          remainingPayment: booking.remaining_amount || 0
        } : undefined,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      }));

      const activeRides = rides.filter(ride => ['pending', 'confirmed', 'assigned', 'in_progress'].includes(ride.status));
      const completedRides = rides.filter(ride => ride.status === 'completed');

      set({
        rides: activeRides,
        pastRides: completedRides,
        loading: false
      });

    } catch (error: any) {
      console.error('Error loading user rides:', error);
      set({ error: error.message, loading: false });
    }
  },

  resetRide: () => set({ currentRide: null, selectedVehicle: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));

export const useRides = () => {
  return useRideStore();
};