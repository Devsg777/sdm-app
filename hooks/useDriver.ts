import { DriverService } from '@/services/driver';
import { BookingService } from '@/services/booking';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';
import { useEffect } from 'react';

interface DriverState {
  profile: any | null;
  vehicles: any[];
  activeRides: any[];
  completedRides: any[];
  earnings: any[];
  earningsSummary: {
    total: number;
    rides: number;
    average: number;
    period: string;
  };
  ratings: any[];
  averageRating: number;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Profile actions
  fetchProfile: () => Promise<void>;
  updateProfile: (driverData: {
    license_number?: string;
    license_document_url?: string;
    id_proof_document_url?: string;
  }) => Promise<boolean>;
  uploadDocument: (file: File, documentType: 'license' | 'id_proof') => Promise<string | null>;
  completeKYC: (kycData: {
    license_number: string;
    license_document_url: string;
    id_proof_document_url: string;
  }) => Promise<boolean>;
  
  // Vehicle actions
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicleData: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    vehicle_type: string;
    registration_document_url?: string;
    insurance_document_url?: string;
  }) => Promise<boolean>;
  updateVehicle: (vehicleId: string, vehicleData: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    license_plate?: string;
    vehicle_type?: string;
    registration_document_url?: string;
    insurance_document_url?: string;
    is_active?: boolean;
  }) => Promise<boolean>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  
  // Ride actions
  fetchActiveRides: () => Promise<void>;
  fetchCompletedRides: () => Promise<void>;
  acceptRide: (bookingId: string) => Promise<boolean>;
  startRide: (bookingId: string) => Promise<boolean>;
  completeRide: (bookingId: string, finalFare?: number) => Promise<boolean>;
  cancelRide: (bookingId: string, reason: string) => Promise<boolean>;
  
  // Earnings actions
  fetchEarnings: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  fetchEarningsSummary: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  
  // Rating actions
  fetchRatings: () => Promise<void>;
  fetchAverageRating: () => Promise<void>;
  
  // Availability actions
  updateAvailability: (isAvailable: boolean) => Promise<boolean>;
  
  // Location actions
  updateLocation: (latitude: number, longitude: number) => Promise<boolean>;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  profile: null,
  vehicles: [],
  activeRides: [],
  completedRides: [],
  earnings: [],
  earningsSummary: {
    total: 0,
    rides: 0,
    average: 0,
    period: 'week',
  },
  ratings: [],
  averageRating: 0,
  isAvailable: false,
  isLoading: false,
  error: null,
  
  fetchProfile: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ profile: null });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const profile = await DriverService.getDriverWithUserDetails(user.id);
      
      set({
        profile,
        isAvailable: profile?.is_available || false,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch driver profile',
        isLoading: false,
      });
    }
  },
  
  updateProfile: async (driverData) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const updatedProfile = await DriverService.updateDriverProfile(user.id, driverData);
      
      if (!updatedProfile) {
        throw new Error('Failed to update driver profile');
      }
      
      set((state) => ({
        profile: { ...state.profile, ...updatedProfile },
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update driver profile',
        isLoading: false,
      });
      return false;
    }
  },
  
  uploadDocument: async (file, documentType) => {
    const { user } = useAuth();
    
    if (!user) {
      return null;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const documentUrl = await DriverService.uploadDriverDocument(user.id, file, documentType);
      
      set({ isLoading: false });
      
      return documentUrl;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to upload document',
        isLoading: false,
      });
      return null;
    }
  },
  
  completeKYC: async (kycData) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const success = await DriverService.completeDriverKYC(user.id, kycData);
      
      if (success) {
        // Refresh profile after KYC completion
        await get().fetchProfile();
      }
      
      set({ isLoading: false });
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to complete KYC',
        isLoading: false,
      });
      return false;
    }
  },
  
  fetchVehicles: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ vehicles: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const vehicles = await DriverService.getDriverVehicles(user.id);
      
      set({
        vehicles,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch vehicles',
        isLoading: false,
      });
    }
  },
  
  addVehicle: async (vehicleData) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const vehicle = await DriverService.addDriverVehicle(user.id, vehicleData);
      
      if (!vehicle) {
        throw new Error('Failed to add vehicle');
      }
      
      set((state) => ({
        vehicles: [...state.vehicles, vehicle],
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to add vehicle',
        isLoading: false,
      });
      return false;
    }
  },
  
  updateVehicle: async (vehicleId, vehicleData) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedVehicle = await DriverService.updateDriverVehicle(vehicleId, vehicleData);
      
      if (!updatedVehicle) {
        throw new Error('Failed to update vehicle');
      }
      
      set((state) => ({
        vehicles: state.vehicles.map(vehicle => 
          vehicle.id === vehicleId ? updatedVehicle : vehicle
        ),
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update vehicle',
        isLoading: false,
      });
      return false;
    }
  },
  
  deleteVehicle: async (vehicleId) => {
    try {
      set({ isLoading: true, error: null });
      
      const success = await DriverService.deleteDriverVehicle(vehicleId);
      
      if (success) {
        set((state) => ({
          vehicles: state.vehicles.filter(vehicle => vehicle.id !== vehicleId),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete vehicle',
        isLoading: false,
      });
      return false;
    }
  },
  
  fetchActiveRides: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ activeRides: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const rides = await BookingService.getDriverActiveBookings(user.id);
      
      set({
        activeRides: rides,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch active rides',
        isLoading: false,
      });
    }
  },
  
  fetchCompletedRides: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ completedRides: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const rides = await BookingService.getDriverCompletedBookings(user.id);
      
      set({
        completedRides: rides,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch completed rides',
        isLoading: false,
      });
    }
  },
  
  acceptRide: async (bookingId) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const booking = await BookingService.assignDriver(bookingId, user.id);
      
      if (!booking) {
        throw new Error('Failed to accept ride');
      }
      
      // Refresh active rides
      await get().fetchActiveRides();
      
      set({ isLoading: false });
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to accept ride',
        isLoading: false,
      });
      return false;
    }
  },
  
  startRide: async (bookingId) => {
    try {
      set({ isLoading: true, error: null });
      
      const booking = await BookingService.startRide(bookingId);
      
      if (!booking) {
        throw new Error('Failed to start ride');
      }
      
      // Refresh active rides
      await get().fetchActiveRides();
      
      set({ isLoading: false });
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to start ride',
        isLoading: false,
      });
      return false;
    }
  },
  
  completeRide: async (bookingId, finalFare) => {
    try {
      set({ isLoading: true, error: null });
      
      const booking = await BookingService.completeRide(bookingId, finalFare);
      
      if (!booking) {
        throw new Error('Failed to complete ride');
      }
      
      // Refresh rides
      await get().fetchActiveRides();
      await get().fetchCompletedRides();
      
      // Refresh earnings
      await get().fetchEarningsSummary();
      
      set({ isLoading: false });
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to complete ride',
        isLoading: false,
      });
      return false;
    }
  },
  
  cancelRide: async (bookingId, reason) => {
    try {
      set({ isLoading: true, error: null });
      
      const booking = await BookingService.cancelBooking(bookingId, reason);
      
      if (!booking) {
        throw new Error('Failed to cancel ride');
      }
      
      // Refresh rides
      await get().fetchActiveRides();
      await get().fetchCompletedRides();
      
      set({ isLoading: false });
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel ride',
        isLoading: false,
      });
      return false;
    }
  },
  
  fetchEarnings: async (period = 'week') => {
    const { user } = useAuth();
    
    if (!user) {
      set({ earnings: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
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
      
      const earnings = await DriverService.getDriverEarnings(
        user.id,
        startDate.toISOString(),
        new Date().toISOString()
      );
      
      set({
        earnings,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch earnings',
        isLoading: false,
      });
    }
  },
  
  fetchEarningsSummary: async (period = 'week') => {
    const { user } = useAuth();
    
    if (!user) {
      set({
        earningsSummary: {
          total: 0,
          rides: 0,
          average: 0,
          period,
        },
      });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const summary = await DriverService.getDriverEarningsSummary(user.id, period);
      
      set({
        earningsSummary: summary,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch earnings summary',
        isLoading: false,
      });
    }
  },
  
  fetchRatings: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ ratings: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const ratings = await DriverService.getDriverRatings(user.id);
      
      set({
        ratings,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch ratings',
        isLoading: false,
      });
    }
  },
  
  fetchAverageRating: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ averageRating: 0 });
      return;
    }
    
    try {
      const rating = await DriverService.getDriverAverageRating(user.id);
      
      set({ averageRating: rating });
    } catch (error: any) {
      console.error('Error fetching average rating:', error);
    }
  },
  
  updateAvailability: async (isAvailable) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const success = await DriverService.updateDriverAvailability(user.id, isAvailable);
      
      if (success) {
        set({
          isAvailable,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update availability',
        isLoading: false,
      });
      return false;
    }
  },
  
  updateLocation: async (latitude, longitude) => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      const location = await DriverService.updateDriverLocation(user.id, latitude, longitude);
      
      return !!location;
    } catch (error: any) {
      console.error('Error updating location:', error);
      return false;
    }
  },
}));

export const useDriver = () => {
  const store = useDriverStore();
  const { user } = useAuth();
  
  // Initialize driver data when the hook is first used
  useEffect(() => {
    if (user) {
      store.fetchProfile();
      store.fetchVehicles();
      store.fetchActiveRides();
      store.fetchEarningsSummary();
      store.fetchAverageRating();
    }
  }, [user]);
  
  return store;
};