import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Location } from '@/types';

type DbLocation = Database['public']['Tables']['locations']['Row'];
type CustomerSavedLocation = Database['public']['Tables']['customer_saved_locations']['Row'];

/**
 * Service for handling location operations
 */
export const LocationService = {
  /**
   * Search for locations by query
   * @param query Search query
   * @returns Array of matching locations
   */
  searchLocations: async (query: string): Promise<Location[]> => {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
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
      console.error('Error searching locations:', error);
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
  getSavedLocations: async (userId: string): Promise<Location[]> => {
    try {
      const { data, error } = await supabase
        .from('customer_saved_locations')
        .select('*')
        .eq('customer_id', userId);

      if (error) throw error;

      return data.map(location => ({
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
  ): Promise<Location | null> => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      return {
        id: data.id,
        name: data.label,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.error('Error saving location:', error);
      return null;
    }
  },

  /**
   * Delete a saved location
   * @param locationId Location ID
   * @returns boolean indicating success
   */
  deleteSavedLocation: async (locationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customer_saved_locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting saved location:', error);
      return false;
    }
  },

  /**
   * Update a saved location
   * @param locationId Location ID
   * @param location Location data to update
   * @returns The updated location or null if there was an error
   */
  updateSavedLocation: async (
    locationId: string,
    location: {
      label?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      is_default?: boolean;
    }
  ): Promise<Location | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_saved_locations')
        .update({
          label: location.label,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          is_default: location.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq('id', locationId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.label,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.error('Error updating saved location:', error);
      return null;
    }
  },

  /**
   * Get a location by ID
   * @param locationId Location ID
   * @returns The location or null if not found
   */
  getLocationById: async (locationId: string): Promise<Location | null> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.error('Error getting location by ID:', error);
      return null;
    }
  },

  /**
   * Create a new location
   * @param location Location data
   * @returns The created location or null if there was an error
   */
  createLocation: async (
    location: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      type?: string;
      is_popular?: boolean;
    }
  ): Promise<Location | null> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          type: location.type,
          is_popular: location.is_popular || false,
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  },

  /**
   * Calculate distance between two locations
   * @param origin Origin location
   * @param destination Destination location
   * @returns Distance in kilometers
   */
  calculateDistance: (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): number => {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  },

  /**
   * Estimate travel time between two locations
   * @param origin Origin location
   * @param destination Destination location
   * @returns Estimated travel time in minutes
   */
  estimateTravelTime: (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): number => {
    // Calculate distance
    const distance = LocationService.calculateDistance(origin, destination);
    
    // Estimate travel time based on average speed of 40 km/h
    const averageSpeed = 40; // km/h
    const travelTimeHours = distance / averageSpeed;
    const travelTimeMinutes = Math.round(travelTimeHours * 60);
    
    return travelTimeMinutes;
  },
};

export default LocationService;