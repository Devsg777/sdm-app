// SMS Service utilities for OTP delivery
// This file contains the SMS integration logic

const SUPABASE_FUNCTION_URL = "https://gmualcoqyztvtsqhjlzb.supabase.co/functions/v1/booking-notifications";

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Formats phone number for SMS delivery
 * Ensures proper international format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  // Return as-is if already properly formatted
  return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
};

/**
 * Generates SMS message for OTP
 */
export const generateOTPMessage = (otp: string, companyName: string = 'SDM E-Mobility Services'): string => {
  return `Your ${companyName} verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
};

export const sendOTPViaWhatsapp = async (phoneNumber: string, otp: string): Promise<SMSResponse> => {
  try {
    // The fetch call to your Supabase Edge Function.
    const response = await fetch('https://gmualcoqyztvtsqhjlzb.supabase.co/functions/v1/booking-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'send.otp',
        data: {
          phone_no: phoneNumber,
          otp: otp,
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to send OTP via WhatsApp. Status: " + response.status);
    }

    // Parse the response from the Edge Function
    const data = await response.json();
    console.log("Edge function response:", data);
    return { success: true, messageId: data.messageId || "OTP sent successfully" };

  } catch (error: any) {
    console.error("Error sending OTP via WhatsApp:", error);
    return { success: false, error: error.message || "Failed to send OTP via WhatsApp" };
  }
}