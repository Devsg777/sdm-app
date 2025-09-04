import { LocationService } from '@/services/location';
import { Location } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';

interface LocationState {
  popularLocations: Location[];
  savedLocations: Location[];
  searchResults: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPopularLocations: () => Promise<void>;
  fetchSavedLocations: () => Promise<void>;
  searchLocations: (query: string) => Promise<void>;
  saveLocation: (location: {
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    is_default?: boolean;
  }) => Promise<boolean>;
  deleteSavedLocation: (locationId: string) => Promise<boolean>;
  selectLocation: (location: Location | null) => void;
  calculateDistance: (origin: Location, destination: Location) => number;
  estimateTravelTime: (origin: Location, destination: Location) => number;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  popularLocations: [],
  savedLocations: [],
  searchResults: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  
  fetchPopularLocations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const locations = await LocationService.getPopularLocations();
      
      set({
        popularLocations: locations,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch popular locations',
        isLoading: false,
      });
    }
  },
  
  fetchSavedLocations: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ savedLocations: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const locations = await LocationService.getSavedLocations(user.id);
      
      set({
        savedLocations: locations,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch saved locations',
        isLoading: false,
      });
    }
  },
  
  searchLocations: async (query: string) => {
    if (!query || query.length < 3) {
      set({ searchResults: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const locations = await LocationService.searchLocations(query);
      
      set({
        searchResults: locations,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search locations',
        isLoading: false,
      });
    }
  },
  
  saveLocation: async (location) => {
    const { user } = useAuth();
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const savedLocation = await LocationService.saveLocation(user.id, location);
      
      if (!savedLocation) {
        throw new Error('Failed to save location');
      }
      
      set((state) => ({
        savedLocations: [...state.savedLocations, savedLocation],
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to save location',
        isLoading: false,
      });
      return false;
    }
  },
  
  deleteSavedLocation: async (locationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const success = await LocationService.deleteSavedLocation(locationId);
      
      if (!success) {
        throw new Error('Failed to delete location');
      }
      
      set((state) => ({
        savedLocations: state.savedLocations.filter(location => location.id !== locationId),
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete location',
        isLoading: false,
      });
      return false;
    }
  },
  
  selectLocation: (location) => {
    set({ selectedLocation: location });
  },
  
  calculateDistance: (origin, destination) => {
    return LocationService.calculateDistance(
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    );
  },
  
  estimateTravelTime: (origin, destination) => {
    return LocationService.estimateTravelTime(
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    );
  },
}));

export const useLocations = () => useLocationStore();