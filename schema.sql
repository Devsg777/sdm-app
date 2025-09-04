-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public._realtime_schema_migrations (
  id integer NOT NULL DEFAULT nextval('_realtime_schema_migrations_id_seq'::regclass),
  version text NOT NULL,
  inserted_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT _realtime_schema_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL CHECK (setting_type = ANY (ARRAY['boolean'::text, 'number'::text, 'string'::text, 'json'::text, 'array'::text])),
  display_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT admin_settings_pkey PRIMARY KEY (id),
  CONSTRAINT admin_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL,
  assigned_region text,
  can_approve_bookings boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (id) REFERENCES public.users(id),
  CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.booking_cancellations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  user_id uuid,
  reason text,
  cancelled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_cancellations_pkey PRIMARY KEY (id),
  CONSTRAINT booking_cancellations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT booking_cancellations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.booking_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE,
  admin_id uuid,
  driver_verified boolean,
  vehicle_verified boolean,
  notes text,
  confirmation_status USER-DEFINED DEFAULT 'pending'::booking_confirmation_status_enum,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_confirmations_pkey PRIMARY KEY (id),
  CONSTRAINT booking_confirmations_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id),
  CONSTRAINT booking_confirmations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.booking_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  whatsapp_user_id text NOT NULL,
  service_type text NOT NULL,
  pickup_address text,
  pickup_latitude double precision,
  pickup_longitude double precision,
  dropoff_address text,
  dropoff_latitude double precision,
  dropoff_longitude double precision,
  scheduled_time timestamp with time zone,
  passenger_count integer DEFAULT 1,
  special_instructions text,
  selected_vehicle_type text,
  estimated_fare numeric,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'pricing'::text, 'confirmed'::text, 'abandoned'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT booking_drafts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chatbot_session_state(id)
);
CREATE TABLE public.booking_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  time_slot_start timestamp with time zone NOT NULL,
  time_slot_end timestamp with time zone NOT NULL,
  reminder_sent boolean DEFAULT false,
  driver_assigned_at timestamp with time zone,
  status text DEFAULT 'scheduled'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT booking_schedules_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.booking_stops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  stop_order integer NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  estimated_duration_minutes integer DEFAULT 15,
  actual_arrival_time timestamp with time zone,
  actual_departure_time timestamp with time zone,
  stop_type text DEFAULT 'intermediate'::text,
  is_completed boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_stops_pkey PRIMARY KEY (id),
  CONSTRAINT booking_stops_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  driver_id uuid,
  vehicle_id uuid,
  pickup_latitude numeric,
  pickup_longitude numeric,
  dropoff_latitude numeric,
  dropoff_longitude numeric,
  pickup_address text NOT NULL,
  dropoff_address text NOT NULL,
  fare_amount numeric CHECK (fare_amount IS NULL OR fare_amount >= 0::numeric),
  distance_km numeric,
  ride_type USER-DEFINED,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status USER-DEFINED DEFAULT 'pending'::booking_status_enum,
  payment_status USER-DEFINED DEFAULT 'pending'::payment_status_enum,
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  service_type_id uuid,
  rental_package_id uuid,
  zone_pricing_id uuid,
  scheduled_time timestamp with time zone,
  is_scheduled boolean DEFAULT false,
  is_shared boolean DEFAULT false,
  sharing_group_id uuid,
  total_stops integer DEFAULT 0,
  package_hours integer,
  included_km integer,
  extra_km_used numeric DEFAULT 0,
  extra_hours_used numeric DEFAULT 0,
  waiting_time_minutes integer DEFAULT 0,
  cancellation_reason text,
  no_show_reason text,
  upgrade_charges numeric DEFAULT 0,
  pickup_location_id uuid,
  dropoff_location_id uuid,
  is_round_trip boolean DEFAULT false,
  return_scheduled_time timestamp with time zone,
  trip_type text,
  vehicle_type text,
  special_instructions text,
  advance_amount numeric,
  remaining_amount numeric,
  passengers integer DEFAULT 1,
  service_type text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_zone_pricing_id_fkey FOREIGN KEY (zone_pricing_id) REFERENCES public.zone_pricing(id),
  CONSTRAINT bookings_rental_package_id_fkey FOREIGN KEY (rental_package_id) REFERENCES public.rental_packages(id),
  CONSTRAINT bookings_pickup_location_id_fkey FOREIGN KEY (pickup_location_id) REFERENCES public.locations(id),
  CONSTRAINT bookings_dropoff_location_id_fkey FOREIGN KEY (dropoff_location_id) REFERENCES public.locations(id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT bookings_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id),
  CONSTRAINT bookings_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
  CONSTRAINT bookings_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id)
);
CREATE TABLE public.chatbot_session_state (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  whatsapp_user_id text NOT NULL UNIQUE,
  current_step text NOT NULL DEFAULT 'start'::text,
  session_data jsonb DEFAULT '{}'::jsonb,
  last_interaction_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'abandoned'::text, 'expired'::text])),
  user_id uuid,
  flow_token text,
  booking_draft_id uuid,
  error_count integer DEFAULT 0,
  flow_screen text,
  flow_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT chatbot_session_state_pkey PRIMARY KEY (id),
  CONSTRAINT chatbot_session_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.communication_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_type text NOT NULL CHECK (thread_type = ANY (ARRAY['chat'::text, 'support'::text, 'booking'::text])),
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])),
  priority text NOT NULL DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
  subject text,
  booking_id uuid,
  customer_id uuid,
  driver_id uuid,
  assigned_admin_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  last_message_at timestamp with time zone,
  CONSTRAINT communication_threads_pkey PRIMARY KEY (id),
  CONSTRAINT communication_threads_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT communication_threads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT communication_threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT communication_threads_assigned_admin_id_fkey FOREIGN KEY (assigned_admin_id) REFERENCES public.admins(id),
  CONSTRAINT communication_threads_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_saved_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  label text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_saved_locations_pkey PRIMARY KEY (id),
  CONSTRAINT customer_saved_locations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL,
  dob date,
  preferred_payment_method text,
  referral_code text UNIQUE,
  loyalty_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_user_id_fkey FOREIGN KEY (id) REFERENCES public.users(id),
  CONSTRAINT customers_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.driver_maintenance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  driver_id uuid,
  vehicle_id uuid,
  description text,
  service_date date,
  next_due_date date,
  status USER-DEFINED DEFAULT 'pending'::maintenance_log_status_enum,
  cost numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT driver_maintenance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT driver_maintenance_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
  CONSTRAINT driver_maintenance_logs_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id)
);
CREATE TABLE public.drivers (
  id uuid NOT NULL,
  license_number text NOT NULL UNIQUE,
  joined_on date DEFAULT now(),
  current_latitude numeric,
  current_longitude numeric,
  rating numeric DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  total_rides integer DEFAULT 0,
  status USER-DEFINED DEFAULT 'active'::driver_status_enum,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  kyc_status text DEFAULT 'pending'::text CHECK (kyc_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'resubmission_requested'::text])),
  license_document_url text,
  id_proof_document_url text,
  rejection_reason text,
  CONSTRAINT drivers_pkey PRIMARY KEY (id),
  CONSTRAINT drivers_user_id_fkey FOREIGN KEY (id) REFERENCES public.users(id),
  CONSTRAINT drivers_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.emergency_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  contact_name text,
  contact_number text,
  CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.faq_options (
  id integer NOT NULL DEFAULT nextval('faq_options_id_seq'::regclass),
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faq_options_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faq_views (
  id integer NOT NULL DEFAULT nextval('faq_views_id_seq'::regclass),
  faq_id integer,
  user_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faq_views_pkey PRIMARY KEY (id),
  CONSTRAINT faq_views_faq_id_fkey FOREIGN KEY (faq_id) REFERENCES public.faq_options(id),
  CONSTRAINT faq_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.feedback_actions (
  id integer NOT NULL DEFAULT nextval('feedback_actions_id_seq'::regclass),
  action text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_actions_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.google_places_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  place_id text NOT NULL UNIQUE,
  formatted_address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  place_types ARRAY,
  city text,
  state text,
  country text DEFAULT 'India'::text,
  search_count integer DEFAULT 1,
  last_searched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_places_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type = ANY (ARRAY['admin'::text, 'customer'::text, 'driver'::text])),
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'file'::text, 'image'::text, 'system'::text])),
  read_by jsonb DEFAULT '[]'::jsonb,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.communication_threads(id)
);
CREATE TABLE public.notification_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_id uuid,
  target_criteria jsonb NOT NULL,
  scheduled_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft'::text,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT notification_campaigns_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id),
  CONSTRAINT notification_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.notification_delivery_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid,
  status text NOT NULL,
  provider text,
  provider_response jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_delivery_logs_pkey PRIMARY KEY (id),
  CONSTRAINT notification_delivery_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id)
);
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  channel USER-DEFINED NOT NULL,
  template_type text NOT NULL DEFAULT 'standard'::text,
  subject text,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_templates_pkey PRIMARY KEY (id),
  CONSTRAINT notification_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  channel USER-DEFINED,
  title text,
  message text,
  sent_at timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  template_id uuid,
  campaign_id uuid,
  delivery_status text DEFAULT 'pending'::text,
  delivery_attempts integer DEFAULT 0,
  delivered_at timestamp with time zone,
  failed_reason text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.notification_campaigns(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  user_id uuid,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR'::text,
  transaction_id text UNIQUE,
  gateway_response jsonb,
  status USER-DEFINED DEFAULT 'pending'::payment_status_enum,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  razorpay_payment_id text UNIQUE,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.phone_otps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT phone_otps_pkey PRIMARY KEY (id),
  CONSTRAINT phone_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.phone_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT phone_verifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pricing_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_type_id uuid NOT NULL,
  base_fare numeric NOT NULL DEFAULT 0,
  per_km_rate numeric NOT NULL DEFAULT 0,
  per_minute_rate numeric DEFAULT 0,
  minimum_fare numeric NOT NULL DEFAULT 0,
  surge_multiplier numeric DEFAULT 1.0,
  cancellation_fee numeric DEFAULT 0,
  no_show_fee numeric DEFAULT 0,
  waiting_charges_per_minute numeric DEFAULT 0,
  free_waiting_time_minutes integer DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  effective_from timestamp with time zone DEFAULT now(),
  effective_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  vehicle_type_id uuid,
  vehicle_type text,
  CONSTRAINT pricing_rules_pkey PRIMARY KEY (id),
  CONSTRAINT pricing_rules_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id),
  CONSTRAINT pricing_rules_vehicle_type_id_fkey FOREIGN KEY (vehicle_type_id) REFERENCES public.vehicle_types(id)
);
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text UNIQUE,
  discount_type text CHECK (discount_type = ANY (ARRAY['flat'::text, 'percentage'::text])),
  discount_value numeric,
  expiry_date date,
  usage_limit integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rental_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vehicle_type text NOT NULL,
  duration_hours integer NOT NULL,
  included_kilometers integer NOT NULL,
  base_price numeric NOT NULL,
  extra_km_rate numeric NOT NULL,
  extra_hour_rate numeric NOT NULL,
  cancellation_fee numeric DEFAULT 50,
  no_show_fee numeric DEFAULT 100,
  waiting_limit_minutes integer DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  vehicle_type_id uuid,
  CONSTRAINT rental_packages_pkey PRIMARY KEY (id),
  CONSTRAINT rental_packages_vehicle_type_id_fkey FOREIGN KEY (vehicle_type_id) REFERENCES public.vehicle_types(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE,
  reviewer_id uuid NOT NULL,
  reviewed_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'flagged'::text, 'archived'::text, 'approved'::text])),
  moderated_by uuid,
  moderated_at timestamp with time zone,
  moderation_notes text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT reviews_reviewed_id_fkey FOREIGN KEY (reviewed_id) REFERENCES public.users(id),
  CONSTRAINT reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id)
);
CREATE TABLE public.ride_passes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  pass_type text,
  rides_remaining integer,
  expiry_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ride_passes_pkey PRIMARY KEY (id),
  CONSTRAINT ride_passes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.saved_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_locations_pkey PRIMARY KEY (id),
  CONSTRAINT saved_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.service_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shared_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sharing_group_id uuid NOT NULL,
  primary_booking_id uuid NOT NULL,
  passenger_booking_id uuid NOT NULL,
  shared_fare_amount numeric NOT NULL,
  fare_split_percentage numeric NOT NULL,
  pickup_sequence integer NOT NULL,
  dropoff_sequence integer NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shared_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT shared_bookings_passenger_booking_id_fkey FOREIGN KEY (passenger_booking_id) REFERENCES public.bookings(id),
  CONSTRAINT shared_bookings_primary_booking_id_fkey FOREIGN KEY (primary_booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  ticket_number text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category = ANY (ARRAY['technical'::text, 'billing'::text, 'driver_issue'::text, 'customer_complaint'::text, 'general'::text])),
  urgency text NOT NULL DEFAULT 'medium'::text CHECK (urgency = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  sla_due_date timestamp with time zone,
  resolution_notes text,
  tags ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.communication_threads(id)
);
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type = ANY (ARRAY['booking_created'::text, 'booking_cancelled'::text, 'driver_assigned'::text, 'payment_completed'::text, 'message_sent'::text, 'ticket_created'::text, 'admin_action'::text])),
  description text NOT NULL,
  metadata jsonb,
  booking_id uuid,
  thread_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.communication_threads(id),
  CONSTRAINT user_activities_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT user_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_preferences (
  user_id uuid NOT NULL,
  dark_mode boolean NOT NULL DEFAULT false,
  notification_enabled boolean NOT NULL DEFAULT true,
  email_notifications boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_promo_usages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  promo_code_id uuid,
  used_on timestamp with time zone DEFAULT now(),
  CONSTRAINT user_promo_usages_pkey PRIMARY KEY (id),
  CONSTRAINT user_promo_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_promo_usages_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id)
);
CREATE TABLE public.user_rewards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  progress numeric NOT NULL DEFAULT 0,
  co2_reduced numeric NOT NULL DEFAULT 0,
  fuel_saved numeric NOT NULL DEFAULT 0,
  trees_saved numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT user_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_settings (
  user_id uuid NOT NULL,
  dark_mode_enabled boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text, 'suspended'::text])),
  blocked_at timestamp with time zone,
  blocked_by uuid,
  block_reason text,
  deleted_at timestamp with time zone,
  last_login_at timestamp with time zone,
  full_name text,
  email text UNIQUE,
  phone_no text UNIQUE,
  profile_picture_url text,
  whatsapp_phone text UNIQUE,
  phone_verified boolean DEFAULT false,
  phone_verification_completed_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES public.users(id)
);
CREATE TABLE public.vehicle_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  alert_type text NOT NULL CHECK (alert_type = ANY (ARRAY['service_due'::text, 'document_expiry'::text, 'insurance_expiry'::text, 'pollution_expiry'::text, 'fitness_expiry'::text, 'custom'::text])),
  title text NOT NULL,
  description text,
  due_date date,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  is_resolved boolean DEFAULT false,
  resolved_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_alerts_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.vehicle_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type = ANY (ARRAY['registration'::text, 'insurance'::text, 'pollution_certificate'::text, 'fitness_certificate'::text])),
  document_url text,
  issue_date date,
  expiry_date date,
  verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_documents_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_documents_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.vehicle_maintenance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  maintenance_date date NOT NULL,
  description text,
  cost numeric,
  performed_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  service_type text DEFAULT 'regular'::text,
  odometer_reading integer,
  next_service_due_date date,
  next_service_due_km integer,
  work_performed text,
  service_center text,
  bill_document_url text,
  CONSTRAINT vehicle_maintenance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_maintenance_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.vehicle_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  odometer_reading integer,
  fuel_consumed numeric,
  distance_traveled numeric,
  fuel_economy numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_performance_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_performance_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.vehicle_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  capacity integer NOT NULL,
  description text,
  base_fare numeric NOT NULL DEFAULT 0,
  per_km_rate numeric NOT NULL DEFAULT 0,
  per_minute_rate numeric DEFAULT 0,
  icon_emoji text DEFAULT '🚗'::text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  make text,
  model text,
  year integer CHECK (year IS NULL OR year >= 1900 AND year::numeric <= (EXTRACT(year FROM CURRENT_DATE) + 1::numeric)),
  license_plate text UNIQUE,
  color text,
  capacity integer,
  status USER-DEFINED DEFAULT 'active'::vehicle_status_enum,
  image_url text,
  vendor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  assigned_driver_id uuid,
  insurance_document_url text,
  registration_document_url text,
  pollution_certificate_url text,
  last_service_date date,
  next_service_due_date date,
  current_odometer integer DEFAULT 0,
  average_fuel_economy numeric,
  monthly_distance numeric,
  vehicle_type_id uuid,
  type text,
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT vehicles_vehicle_type_id_fkey FOREIGN KEY (vehicle_type_id) REFERENCES public.vehicle_types(id),
  CONSTRAINT vehicles_assigned_driver_id_fkey FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id),
  CONSTRAINT vehicles_type_fkey FOREIGN KEY (type) REFERENCES public.vehicle_types(name),
  CONSTRAINT vehicles_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT vehicles_assigned_driver_fkey FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id)
);
CREATE TABLE public.vendors (
  id uuid NOT NULL,
  company_name text NOT NULL,
  gst_number text UNIQUE,
  address text,
  contact_person text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendors_pkey PRIMARY KEY (id),
  CONSTRAINT vendors_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_id uuid,
  amount numeric,
  type text CHECK (type = ANY (ARRAY['top_up'::text, 'deduction'::text, 'refund'::text])),
  description text,
  status text DEFAULT 'completed'::text,
  transaction_date timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id)
);
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  balance numeric DEFAULT 0,
  currency text DEFAULT 'INR'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.whatsapp_message_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  whatsapp_user_id text NOT NULL,
  message_type text NOT NULL CHECK (message_type = ANY (ARRAY['incoming'::text, 'outgoing'::text])),
  content_type text NOT NULL,
  message_content jsonb NOT NULL,
  status text DEFAULT 'sent'::text CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT whatsapp_message_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.zone_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_type_id uuid NOT NULL,
  zone_name text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  vehicle_type text NOT NULL,
  fixed_price numeric,
  base_price numeric,
  per_km_rate numeric,
  estimated_distance_km numeric,
  estimated_duration_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT zone_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT zone_pricing_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id)
);