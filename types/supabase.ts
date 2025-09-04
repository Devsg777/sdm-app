// Auto-generated Supabase types based on database schema
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          assigned_region: string | null
          can_approve_bookings: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          assigned_region?: string | null
          can_approve_bookings?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assigned_region?: string | null
          can_approve_bookings?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          driver_id: string | null
          vehicle_id: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          pickup_address: string
          dropoff_address: string
          fare_amount: number | null
          distance_km: number | null
          ride_type: string | null
          start_time: string | null
          end_time: string | null
          status: string
          payment_status: string
          payment_method: string | null
          created_at: string
          updated_at: string
          service_type_id: string | null
          rental_package_id: string | null
          zone_pricing_id: string | null
          scheduled_time: string | null
          is_scheduled: boolean
          is_shared: boolean
          sharing_group_id: string | null
          total_stops: number
          package_hours: number | null
          included_km: number | null
          extra_km_used: number
          extra_hours_used: number
          waiting_time_minutes: number
          cancellation_reason: string | null
          no_show_reason: string | null
          upgrade_charges: number
          pickup_location_id: string | null
          dropoff_location_id: string | null
          is_round_trip: boolean
          return_scheduled_time: string | null
          trip_type: string | null
          vehicle_type: string | null
          special_instructions: string | null
          advance_amount: number | null
          remaining_amount: number | null
          passengers: number
          service_type: string | null
        }
        Insert: {
          id?: string
          user_id: string
          driver_id?: string | null
          vehicle_id?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          pickup_address: string
          dropoff_address: string
          fare_amount?: number | null
          distance_km?: number | null
          ride_type?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string
          payment_status?: string
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          service_type_id?: string | null
          rental_package_id?: string | null
          zone_pricing_id?: string | null
          scheduled_time?: string | null
          is_scheduled?: boolean
          is_shared?: boolean
          sharing_group_id?: string | null
          total_stops?: number
          package_hours?: number | null
          included_km?: number | null
          extra_km_used?: number
          extra_hours_used?: number
          waiting_time_minutes?: number
          cancellation_reason?: string | null
          no_show_reason?: string | null
          upgrade_charges?: number
          pickup_location_id?: string | null
          dropoff_location_id?: string | null
          is_round_trip?: boolean
          return_scheduled_time?: string | null
          trip_type?: string | null
          vehicle_type?: string | null
          special_instructions?: string | null
          advance_amount?: number | null
          remaining_amount?: number | null
          passengers?: number
          service_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          driver_id?: string | null
          vehicle_id?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          pickup_address?: string
          dropoff_address?: string
          fare_amount?: number | null
          distance_km?: number | null
          ride_type?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string
          payment_status?: string
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          service_type_id?: string | null
          rental_package_id?: string | null
          zone_pricing_id?: string | null
          scheduled_time?: string | null
          is_scheduled?: boolean
          is_shared?: boolean
          sharing_group_id?: string | null
          total_stops?: number
          package_hours?: number | null
          included_km?: number | null
          extra_km_used?: number
          extra_hours_used?: number
          waiting_time_minutes?: number
          cancellation_reason?: string | null
          no_show_reason?: string | null
          upgrade_charges?: number
          pickup_location_id?: string | null
          dropoff_location_id?: string | null
          is_round_trip?: boolean
          return_scheduled_time?: string | null
          trip_type?: string | null
          vehicle_type?: string | null
          special_instructions?: string | null
          advance_amount?: number | null
          remaining_amount?: number | null
          passengers?: number
          service_type?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          dob: string | null
          preferred_payment_method: string | null
          referral_code: string | null
          loyalty_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          dob?: string | null
          preferred_payment_method?: string | null
          referral_code?: string | null
          loyalty_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dob?: string | null
          preferred_payment_method?: string | null
          referral_code?: string | null
          loyalty_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          license_number: string
          joined_on: string
          current_latitude: number | null
          current_longitude: number | null
          rating: number
          total_rides: number
          status: string
          created_at: string
          updated_at: string
          kyc_status: string
          license_document_url: string | null
          id_proof_document_url: string | null
          rejection_reason: string | null
        }
        Insert: {
          id: string
          license_number: string
          joined_on?: string
          current_latitude?: number | null
          current_longitude?: number | null
          rating?: number
          total_rides?: number
          status?: string
          created_at?: string
          updated_at?: string
          kyc_status?: string
          license_document_url?: string | null
          id_proof_document_url?: string | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          license_number?: string
          joined_on?: string
          current_latitude?: number | null
          current_longitude?: number | null
          rating?: number
          total_rides?: number
          status?: string
          created_at?: string
          updated_at?: string
          kyc_status?: string
          license_document_url?: string | null
          id_proof_document_url?: string | null
          rejection_reason?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          latitude: number
          longitude: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          latitude: number
          longitude: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          latitude?: number
          longitude?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string | null
          user_id: string
          amount: number
          currency: string
          transaction_id: string | null
          gateway_response: any | null
          status: string
          created_at: string
          updated_at: string
          razorpay_payment_id: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          user_id: string
          amount: number
          currency?: string
          transaction_id?: string | null
          gateway_response?: any | null
          status?: string
          created_at?: string
          updated_at?: string
          razorpay_payment_id?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          user_id?: string
          amount?: number
          currency?: string
          transaction_id?: string | null
          gateway_response?: any | null
          status?: string
          created_at?: string
          updated_at?: string
          razorpay_payment_id?: string | null
        }
      }
      service_types: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          role: string
          created_at: string
          updated_at: string
          status: string
          blocked_at: string | null
          blocked_by: string | null
          block_reason: string | null
          deleted_at: string | null
          last_login_at: string | null
          full_name: string | null
          email: string | null
          phone_no: string | null
          profile_picture_url: string | null
          whatsapp_phone: string | null
          phone_verified: boolean
          phone_verification_completed_at: string | null
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
          updated_at?: string
          status?: string
          blocked_at?: string | null
          blocked_by?: string | null
          block_reason?: string | null
          deleted_at?: string | null
          last_login_at?: string | null
          full_name?: string | null
          email?: string | null
          phone_no?: string | null
          profile_picture_url?: string | null
          whatsapp_phone?: string | null
          phone_verified?: boolean
          phone_verification_completed_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
          updated_at?: string
          status?: string
          blocked_at?: string | null
          blocked_by?: string | null
          block_reason?: string | null
          deleted_at?: string | null
          last_login_at?: string | null
          full_name?: string | null
          email?: string | null
          phone_no?: string | null
          profile_picture_url?: string | null
          whatsapp_phone?: string | null
          phone_verified?: boolean
          phone_verification_completed_at?: string | null
        }
      }
      vehicle_types: {
        Row: {
          id: string
          name: string
          display_name: string
          capacity: number
          description: string | null
          base_fare: number
          per_km_rate: number
          per_minute_rate: number | null
          icon_emoji: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          capacity?: number
          description?: string | null
          base_fare?: number
          per_km_rate?: number
          per_minute_rate?: number | null
          icon_emoji?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          capacity?: number
          description?: string | null
          base_fare?: number
          per_km_rate?: number
          per_minute_rate?: number | null
          icon_emoji?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          make: string | null
          model: string | null
          year: number | null
          license_plate: string
          color: string | null
          capacity: number
          status: string
          image_url: string | null
          vendor_id: string | null
          created_at: string
          updated_at: string
          assigned_driver_id: string | null
          insurance_document_url: string | null
          registration_document_url: string | null
          pollution_certificate_url: string | null
          last_service_date: string | null
          next_service_due_date: string | null
          current_odometer: number
          average_fuel_economy: number | null
          monthly_distance: number | null
          vehicle_type_id: string
          type: string | null
        }
        Insert: {
          id?: string
          make?: string | null
          model?: string | null
          year?: number | null
          license_plate: string
          color?: string | null
          capacity?: number
          status?: string
          image_url?: string | null
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
          assigned_driver_id?: string | null
          insurance_document_url?: string | null
          registration_document_url: string | null
          pollution_certificate_url?: string | null
          last_service_date?: string | null
          next_service_due_date?: string | null
          current_odometer?: number
          average_fuel_economy?: number | null
          monthly_distance?: number | null
          vehicle_type_id: string
          type?: string | null
        }
        Update: {
          id?: string
          make?: string | null
          model?: string | null
          year?: number | null
          license_plate?: string
          color?: string | null
          capacity?: number
          status?: string
          image_url?: string | null
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
          assigned_driver_id?: string | null
          insurance_document_url?: string | null
          registration_document_url?: string | null
          pollution_certificate_url?: string | null
          last_service_date?: string | null
          next_service_due_date?: string | null
          current_odometer?: number
          average_fuel_economy?: number | null
          monthly_distance?: number | null
          vehicle_type_id?: string
          type?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_phone_verification: {
        Args: { p_phone_number: string }
        Returns: { otp_code: string }[]
      }
      verify_phone_otp: {
        Args: { p_phone_number: string; p_otp_code: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_confirmation_status_enum: "pending" | "approved" | "rejected"
      booking_status_enum: "pending" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled" | "no_show"
      driver_status_enum: "active" | "inactive" | "suspended"
      maintenance_log_status_enum: "pending" | "completed" | "cancelled"
      notification_channel_enum: "email" | "sms" | "push" | "whatsapp"
      payment_status_enum: "pending" | "partial" | "completed" | "failed" | "refunded"
      user_role_enum: "customer" | "driver" | "admin" | "vendor"
      vehicle_status_enum: "active" | "inactive" | "maintenance" | "out_of_service"
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]