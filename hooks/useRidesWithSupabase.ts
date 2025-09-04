import { BookingService } from '@/services/booking';
import { Location, Ride, RideStatus, TripType, Vehicle } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RideState = {
  currentRide: Partial<Ride> | null;
  selectedVehicle: Vehicle | null;
  rides: Ride[];
  pastRides: Ride[];
  isLoading: boolean;
  error: string | null;
  
  // Ride creation actions
  setBookingType: (type: string) => void;
  setTripType: (type: TripType) => void;
  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
  setDateTime: (date: string, time: string) => void;
  setPassengers: (count: number) => void;
  setHours: (hours: string) => void;
  setVehicle: (vehicle: Vehicle) => void;
  setPaymentMethod: (method: 'card' | 'upi') => void;
  
  // Ride management actions
  confirmBooking: () => Promise<{ success: boolean; bookingId?: string; error?: string }>;
  completeRide: (rating?: number, review?: string) => Promise<{ success: boolean; error?: string }>;
  cancelRide: (reason: string) => Promise<{ success: boolean; error?: string }>;
  updateRideStatus: (rideId: string, status: RideStatus) => Promise<{ success: boolean; error?: string }>;
  resetRide: () => void;
  
  // Data fetching actions
  fetchUserRides: () => Promise<void>;
  fetchRideById: (rideId: string) => Promise<Ride | null>;
  fetchAvailableVehicles: (serviceType: string) => Promise<Vehicle[]>;
  calculateFare: () => Promise<void>;
};

export const useRideStore = create<RideState>()(
  persist(
    (set, get) => ({
      currentRide: null,
      selectedVehicle: null,
      rides: [],
      pastRides: [],
      isLoading: false,
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
      
      setVehicle: async (vehicle) => {
        set((state) => ({
          selectedVehicle: vehicle,
          currentRide: { 
            ...state.currentRide, 
            vehicle,
          } 
        }));
        
        // Calculate fare after setting vehicle
        await get().calculateFare();
      },
      
      setPaymentMethod: (paymentMethod) => 
        set((state) => ({ 
          currentRide: { ...state.currentRide, paymentMethod } 
        })),
      
      calculateFare: async () => {
        const { currentRide, selectedVehicle } = get();
        
        if (!currentRide || !selectedVehicle) {
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Mock distance and duration for now
          const distance = 15; // km
          const duration = 25; // minutes
          
          // Calculate fare using the service
          const fare = await BookingService.calculateFare(
            currentRide.bookingType || 'city',
            distance,
            duration,
            selectedVehicle.type
          );
          
          if (!fare) {
            throw new Error('Failed to calculate fare');
          }
          
          set((state) => ({
            currentRide: {
              ...state.currentRide,
              distance,
              duration,
              fare,
            },
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || 'Failed to calculate fare',
            isLoading: false,
          });
        }
      },
      
      confirmBooking: async () => {
        const { currentRide, selectedVehicle } = get();
        const { user } = useAuth();
        
        if (!currentRide || !selectedVehicle || !user) {
          return { success: false, error: 'Missing required booking information' };
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Prepare booking data
          const bookingData = {
            user_id: user.id,
            pickup_address: currentRide.pickup?.address || '',
            pickup_latitude: currentRide.pickup?.latitude || 0,
            pickup_longitude: currentRide.pickup?.longitude || 0,
            dropoff_address: currentRide.dropoff?.address || '',
            dropoff_latitude: currentRide.dropoff?.latitude || 0,
            dropoff_longitude: currentRide.dropoff?.longitude || 0,
            scheduled_time: currentRide.date && currentRide.time 
              ? `${currentRide.date}T${currentRide.time}:00` 
              : new Date().toISOString(),
            is_scheduled: !!currentRide.date && !!currentRide.time,
            service_type: currentRide.bookingType || 'city',
            trip_type: currentRide.tripType || 'one-way',
            vehicle_type: selectedVehicle.type,
            passengers: currentRide.passengers || 1,
            fare_amount: currentRide.fare?.total || 0,
            distance_km: currentRide.distance || 0,
            status: 'pending',
            payment_status: 'pending',
            payment_method: currentRide.paymentMethod || 'card',
            advance_amount: currentRide.fare?.advancePayment || 0,
            remaining_amount: currentRide.fare?.remainingPayment || 0,
            special_instructions: currentRide.specialInstructions || '',
          };
          
          // Create booking in database
          const booking = await BookingService.createBooking(bookingData);
          
          if (!booking) {
            throw new Error('Failed to create booking');
          }
          
          // Process payment if needed
          if (currentRide.paymentMethod && currentRide.fare?.advancePayment) {
            await BookingService.processPayment(
              booking.id,
              currentRide.fare.advancePayment,
              currentRide.paymentMethod,
              true
            );
          }
          
          // Update local state
          const newRide: Ride = {
            id: booking.id,
            riderId: user.id,
            bookingType: currentRide.bookingType || 'city',
            tripType: currentRide.tripType || 'one-way',
            pickup: currentRide.pickup!,
            dropoff: currentRide.dropoff!,
            date: currentRide.date || new Date().toISOString().split('T')[0],
            time: currentRide.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            passengers: currentRide.passengers || 1,
            passengerInfo: currentRide.passengerInfo || [],
            status: 'pending',
            fare: currentRide.fare!,
            paymentMethod: currentRide.paymentMethod,
            paymentStatus: 'partial',
            distance: currentRide.distance || 0,
            duration: currentRide.duration || 0,
            vehicle: selectedVehicle,
          };
          
          set((state) => ({
            rides: [...state.rides, newRide],
            currentRide: newRide,
            isLoading: false,
          }));
          
          return { success: true, bookingId: booking.id };
        } catch (error: any) {
          set({
            error: error.message || 'Failed to confirm booking',
            isLoading: false,
          });
          return { success: false, error: error.message || 'Failed to confirm booking' };
        }
      },
      
      completeRide: async (rating?: number, review?: string) => {
        const { currentRide } = get();
        const { user } = useAuth();
        
        if (!currentRide || !currentRide.id || !user) {
          return { success: false, error: 'No active ride to complete' };
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Update booking status in database
          const updatedBooking = await BookingService.updateBooking(currentRide.id, {
            status: 'completed',
            payment_status: 'completed',
            end_time: new Date().toISOString(),
          });
          
          if (!updatedBooking) {
            throw new Error('Failed to update booking status');
          }
          
          // Add rating if provided
          if (rating && updatedBooking.driver_id) {
            await BookingService.rateBooking(
              currentRide.id,
              user.id,
              updatedBooking.driver_id,
              rating,
              review
            );
          }
          
          // Update local state
          const completedRide: Ride = {
            ...currentRide,
            status: 'completed',
            paymentStatus: 'completed',
            rating,
            review,
          } as Ride;
          
          set((state) => ({
            rides: state.rides.map(ride => 
              ride.id === completedRide.id ? completedRide : ride
            ),
            pastRides: [...state.pastRides, completedRide],
            currentRide: null,
            selectedVehicle: null,
            isLoading: false,
          }));
          
          return { success: true };
        } catch (error: any) {
          set({
            error: error.message || 'Failed to complete ride',
            isLoading: false,
          });
          return { success: false, error: error.message || 'Failed to complete ride' };
        }
      },
      
      cancelRide: async (reason: string) => {
        const { currentRide } = get();
        
        if (!currentRide || !currentRide.id) {
          return { success: false, error: 'No active ride to cancel' };
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Cancel booking in database
          const cancelledBooking = await BookingService.cancelBooking(currentRide.id, reason);
          
          if (!cancelledBooking) {
            throw new Error('Failed to cancel booking');
          }
          
          // Update local state
          const cancelledRide: Ride = {
            ...currentRide,
            status: 'cancelled',
            cancellationReason: reason,
          } as Ride;
          
          set((state) => ({
            rides: state.rides.map(ride => 
              ride.id === cancelledRide.id ? cancelledRide : ride
            ),
            currentRide: null,
            selectedVehicle: null,
            isLoading: false,
          }));
          
          return { success: true };
        } catch (error: any) {
          set({
            error: error.message || 'Failed to cancel ride',
            isLoading: false,
          });
          return { success: false, error: error.message || 'Failed to cancel ride' };
        }
      },
      
      updateRideStatus: async (rideId: string, status: RideStatus) => {
        try {
          set({ isLoading: true, error: null });
          
          // Update booking status in database
          const updatedBooking = await BookingService.updateBooking(rideId, {
            status: status,
          });
          
          if (!updatedBooking) {
            throw new Error('Failed to update ride status');
          }
          
          // Update local state
          set((state) => ({
            rides: state.rides.map(ride => 
              ride.id === rideId ? { ...ride, status } : ride
            ),
            isLoading: false,
          }));
          
          return { success: true };
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update ride status',
            isLoading: false,
          });
          return { success: false, error: error.message || 'Failed to update ride status' };
        }
      },
      
      resetRide: () => set({ currentRide: null, selectedVehicle: null }),
      
      fetchUserRides: async () => {
        const { user } = useAuth();
        
        if (!user) {
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Fetch active and completed rides
          const activeRides = await BookingService.getActiveBookings(user.id);
          const completedRides = await BookingService.getCompletedBookings(user.id);
          
          // Convert database bookings to app Ride format
          const mapBookingToRide = (booking: any): Ride => ({
            id: booking.id,
            riderId: booking.user_id,
            driverId: booking.driver_id,
            bookingType: booking.service_type || 'city',
            tripType: booking.trip_type || 'one-way',
            pickup: {
              id: booking.pickup_location_id || 'pickup',
              name: 'Pickup',
              address: booking.pickup_address,
              latitude: booking.pickup_latitude,
              longitude: booking.pickup_longitude,
            },
            dropoff: {
              id: booking.dropoff_location_id || 'dropoff',
              name: 'Dropoff',
              address: booking.dropoff_address,
              latitude: booking.dropoff_latitude,
              longitude: booking.dropoff_longitude,
            },
            date: booking.scheduled_time ? new Date(booking.scheduled_time).toISOString().split('T')[0] : '',
            time: booking.scheduled_time ? new Date(booking.scheduled_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
            passengers: booking.passengers || 1,
            status: booking.status,
            fare: {
              base: 0, // These would need to be fetched from a separate fare table
              distance: 0,
              time: 0,
              surge: 0,
              tax: 0,
              total: booking.fare_amount || 0,
              advancePayment: booking.advance_amount || 0,
              remainingPayment: booking.remaining_amount || 0,
            },
            paymentMethod: booking.payment_method,
            paymentStatus: booking.payment_status,
            distance: booking.distance_km || 0,
            duration: 0, // This would need to be calculated
            vehicle: {
              id: booking.vehicle_id || '1',
              name: booking.vehicle_type || 'Sedan',
              type: booking.vehicle_type || 'sedan',
              description: '',
              passengers: booking.passengers || 4,
              price: booking.fare_amount || 0,
              estimatedTime: '',
              image: booking.vehicle_type || 'sedan',
              features: [],
            },
          });
          
          const mappedActiveRides = activeRides.map(mapBookingToRide);
          const mappedCompletedRides = completedRides.map(mapBookingToRide);
          
          set({
            rides: mappedActiveRides,
            pastRides: mappedCompletedRides,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch rides',
            isLoading: false,
          });
        }
      },
      
      fetchRideById: async (rideId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const booking = await BookingService.getBookingById(rideId);
          
          if (!booking) {
            throw new Error('Ride not found');
          }
          
          // Convert database booking to app Ride format
          const ride: Ride = {
            id: booking.id,
            riderId: booking.user_id,
            driverId: booking.driver_id || undefined,
            bookingType: booking.service_type || 'city',
            tripType: booking.trip_type as TripType || 'one-way',
            pickup: {
              id: booking.pickup_location_id || 'pickup',
              name: 'Pickup',
              address: booking.pickup_address,
              latitude: booking.pickup_latitude || 0,
              longitude: booking.pickup_longitude || 0,
            },
            dropoff: {
              id: booking.dropoff_location_id || 'dropoff',
              name: 'Dropoff',
              address: booking.dropoff_address,
              latitude: booking.dropoff_latitude || 0,
              longitude: booking.dropoff_longitude || 0,
            },
            date: booking.scheduled_time ? new Date(booking.scheduled_time).toISOString().split('T')[0] : '',
            time: booking.scheduled_time ? new Date(booking.scheduled_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
            passengers: booking.passengers || 1,
            status: booking.status as RideStatus,
            fare: {
              base: 0,
              distance: 0,
              time: 0,
              surge: 0,
              tax: 0,
              total: booking.fare_amount || 0,
              advancePayment: booking.advance_amount || 0,
              remainingPayment: booking.remaining_amount || 0,
            },
            paymentMethod: booking.payment_method,
            paymentStatus: booking.payment_status,
            distance: booking.distance_km || 0,
            duration: 0,
            vehicle: {
              id: booking.vehicle_id || '1',
              name: booking.vehicle_type || 'Sedan',
              type: booking.vehicle_type || 'sedan',
              description: '',
              passengers: booking.passengers || 4,
              price: booking.fare_amount || 0,
              estimatedTime: '',
              image: booking.vehicle_type || 'sedan',
              features: [],
            },
          };
          
          set({ isLoading: false });
          return ride;
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch ride',
            isLoading: false,
          });
          return null;
        }
      },
      
      fetchAvailableVehicles: async (serviceType: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const vehicles = await BookingService.getAvailableVehicles(serviceType);
          
          set({ isLoading: false });
          return vehicles;
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch available vehicles',
            isLoading: false,
          });
          return [];
        }
      },
    }),
    {
      name: 'ride-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentRide: state.currentRide,
        selectedVehicle: state.selectedVehicle,
        rides: state.rides,
        pastRides: state.pastRides,
      }),
    }
  )
);

export const useRidesWithSupabase = () => useRideStore();