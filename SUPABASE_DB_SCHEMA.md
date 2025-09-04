# Supabase Database Schema for SDM Cab Booking App

This document outlines the database schema required for the SDM Cab Booking app's authentication system.

## Tables

### 1. users

This table extends the default Supabase auth.users table with additional fields.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'admin')),
  email TEXT,
  phone_no TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);
```

### 2. phone_verifications

This table stores OTP codes for phone verification.

```sql
CREATE TABLE public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "No direct access to phone_verifications"
  ON public.phone_verifications
  FOR ALL
  USING (false);
```

## Functions

### 1. create_phone_verification

This function creates a new OTP code for phone verification.

```sql
CREATE OR REPLACE FUNCTION public.create_phone_verification(p_phone_number TEXT)
RETURNS TABLE (otp_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp_code TEXT;
BEGIN
  -- Generate a 6-digit OTP
  v_otp_code := floor(random() * 900000 + 100000)::TEXT;
  
  -- Delete any existing OTPs for this phone number
  DELETE FROM public.phone_verifications
  WHERE phone_number = p_phone_number;
  
  -- Insert new OTP
  INSERT INTO public.phone_verifications (phone_number, otp_code)
  VALUES (p_phone_number, v_otp_code);
  
  -- Return the OTP code
  RETURN QUERY SELECT v_otp_code;
END;
$$;
```

### 2. verify_phone_otp

This function verifies an OTP code for phone verification.

```sql
CREATE OR REPLACE FUNCTION public.verify_phone_otp(p_phone_number TEXT, p_otp_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if OTP is valid and not expired
  SELECT EXISTS (
    SELECT 1
    FROM public.phone_verifications
    WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code
    AND verified = FALSE
    AND expires_at > NOW()
  ) INTO v_valid;
  
  -- If valid, mark as verified
  IF v_valid THEN
    UPDATE public.phone_verifications
    SET verified = TRUE
    WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code;
  END IF;
  
  RETURN v_valid;
END;
$$;
```

## Triggers

### 1. Update user_updated_at

This trigger updates the updated_at field whenever a user record is updated.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

## Setup Instructions

1. Create the tables and functions in your Supabase project using the SQL Editor.
2. Set up the Edge Function for WhatsApp OTP delivery.
3. Configure the appropriate permissions and policies.

## Edge Function: booking-notifications

This Edge Function handles sending OTP codes via WhatsApp.

```typescript
// booking-notifications.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
const WHATSAPP_ACCESS_TOKEN = 'YOUR_WHATSAPP_ACCESS_TOKEN';

serve(async (req) => {
  try {
    const { type, data } = await req.json();
    
    if (type === 'send.otp') {
      const { phone_no, otp } = data;
      
      // Format message
      const message = `Your SDM E-Mobility Services verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      
      // Send WhatsApp message
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone_no,
          type: 'text',
          text: {
            body: message
          }
        })
      });
      
      const result = await response.json();
      
      return new Response(
        JSON.stringify({ success: true, messageId: result.messages?.[0]?.id }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
```

Replace `YOUR_PHONE_NUMBER_ID` and `YOUR_WHATSAPP_ACCESS_TOKEN` with your actual WhatsApp Business API credentials.