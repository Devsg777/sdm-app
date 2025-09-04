// User and Authentication Types
export type UserRole = 'customer' | 'driver' | 'admin' | 'vendor' | null;

export type User = {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  status: 'active' | 'blocked' | 'suspended';
  blocked_at?: string;
  blocked_by?: string;
  block_reason?: string;
  deleted_at?: string;
  last_login_at?: string;
  full_name?: string;
  email?: string;
  phone_no?: string;
  profile_picture_url?: string;
  whatsapp_phone?: string;
  phone_verified: boolean;
  phone_verification_completed_at?: string;
};

export type Customer = User & {
  dob?: string;
  preferred_payment_method?: string;
  referral_code?: string;
  loyalty_points: number;
};

export type Driver = User & {
  license_number: string;
  joined_on: string;
  current_latitude?: number;
  current_longitude?: number;
  rating: number;
  total_rides: number;
  status: 'active' | 'inactive' | 'suspended';
  kyc_status: 'pending' | 'approved' | 'rejected' | 'resubmission_requested';
  license_document_url?: string;
  id_proof_document_url?: string;
  rejection_reason?: string;
};

export type Admin = User & {
  assigned_region?: string;
  can_approve_bookings: boolean;
};

export type Vendor = User & {
  company_name: string;
  gst_number?: string;
  address?: string;
  contact_person?: string;
};

// Location and Address Types
export type Location = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: string;
};

export type SavedAddress = {
  id: string;
  user_id?: string;
  title?: string;
  name?: string; // For backward compatibility
  type?: 'home' | 'work' | 'other'; // For backward compatibility
  address: string;
  latitude: number;
  longitude: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Vehicle Types
export type VehicleType = {
  id: string;
  name: string;
  display_name: string;
  capacity: number;
  description?: string;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate?: number;
  icon_emoji?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Vehicle = {
  id: string;
  name?: string; // For backward compatibility
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  color?: string;
  capacity: number;
  status?: 'active' | 'inactive' | 'maintenance' | 'out_of_service';
  image?: string; // For backward compatibility
  image_url?: string;
  vendor_id?: string;
  assigned_driver_id?: string;
  created_at?: string;
  updated_at?: string;
  last_service_date?: string;
  next_service_due_date?: string;
  current_odometer?: number;
  average_fuel_economy?: number;
  monthly_distance?: number;
  vehicle_type_id?: string;
  type?: string;
  vehicle_type?: VehicleType;
  price?: number; // For backward compatibility
  rating?: number; // For backward compatibility
  seatingCapacity?: number; // For backward compatibility
  features?: string[]; // For backward compatibility
};

// Service and Booking Types
export type ServiceType = {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BookingType = 'airport' | 'outstation' | 'hourly' | 'city' | 'shared';
export type TripType = 'one-way' | 'round-trip' | 'shared';
export type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'accepted' | 'arriving' | 'arrived';
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';

export type Booking = {
  id: string;
  user_id: string;
  driver_id?: string;
  vehicle_id?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  pickup_address: string;
  dropoff_address: string;
  fare_amount?: number;
  distance_km?: number;
  ride_type?: string;
  start_time?: string;
  end_time?: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  service_type_id?: string;
  rental_package_id?: string;
  zone_pricing_id?: string;
  scheduled_time?: string;
  is_scheduled: boolean;
  is_shared: boolean;
  sharing_group_id?: string;
  total_stops: number;
  package_hours?: number;
  included_km?: number;
  extra_km_used: number;
  extra_hours_used: number;
  waiting_time_minutes: number;
  cancellation_reason?: string;
  no_show_reason?: string;
  upgrade_charges: number;
  pickup_location_id?: string;
  dropoff_location_id?: string;
  is_round_trip: boolean;
  return_scheduled_time?: string;
  trip_type?: string;
  vehicle_type?: string;
  special_instructions?: string;
  advance_amount?: number;
  remaining_amount?: number;
  passengers: number;
  service_type?: string;

  // Relations
  user?: User;
  driver?: Driver;
  vehicle?: Vehicle;
  service_type_data?: ServiceType;
  pickup_location?: Location;
  dropoff_location?: Location;
};

// Payment Types
export type Payment = {
  id: string;
  booking_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  transaction_id?: string;
  gateway_response?: any;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  razorpay_payment_id?: string;
};

// Review and Rating Types
export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'flagged' | 'archived' | 'approved';
  moderated_by?: string;
  moderated_at?: string;
  moderation_notes?: string;
};

// Communication Types
export type CommunicationThread = {
  id: string;
  thread_type: 'chat' | 'support' | 'booking';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject?: string;
  booking_id?: string;
  customer_id?: string;
  driver_id?: string;
  assigned_admin_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  last_message_at?: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: 'admin' | 'customer' | 'driver';
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  read_by: string[];
  is_internal: boolean;
  created_at: string;
  updated_at: string;
};

// Pricing Types
export type PricingRule = {
  id: string;
  service_type_id: string;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate?: number;
  minimum_fare: number;
  surge_multiplier: number;
  cancellation_fee: number;
  no_show_fee: number;
  waiting_charges_per_minute: number;
  free_waiting_time_minutes: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
  vehicle_type_id?: string;
  vehicle_type?: string;
};

// Legacy types for backward compatibility
export type RideStatus = BookingStatus;
export type PassengerInfo = {
  name: string;
  age: number;
  phone: string;
};

export type Ride = {
  // Core booking fields
  id: string;
  riderId?: string;
  driverId?: string;
  user_id?: string;
  bookingType: BookingType;
  tripType: TripType;
  pickup?: Location;
  dropoff?: Location;
  pickup_address?: string;
  dropoff_address?: string;
  date?: string;
  time?: string;
  scheduled_time?: string;
  passengers: number;
  hours?: string;
  passengerInfo?: PassengerInfo[];
  vehicle?: Vehicle;
  status: RideStatus;
  payment_status?: PaymentStatus;
  paymentStatus?: PaymentStatus; // For backward compatibility
  fare?: {
    base: number;
    distance: number;
    time: number;
    surge: number;
    tax: number;
    total: number;
    advancePayment: number;
    remainingPayment: number;
  };
  fare_amount?: number;
  advance_amount?: number;
  remaining_amount?: number;
  paymentMethod?: 'card' | 'upi' | string;
  distance?: number;
  duration?: number;
  rating?: number;
  review?: string;

  // Additional booking fields
  created_at?: string;
  updated_at?: string;
  service_type?: string;
  special_instructions?: string;
  is_scheduled?: boolean;
  vehicle_type?: string;
};

export type Theme = 'light' | 'dark';

// API Response Types
export type ApiResponse<T> = {
  data: T;
  error: string | null;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};