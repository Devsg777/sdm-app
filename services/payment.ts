import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

/**
 * Service for handling payment operations
 */
export const PaymentService = {
  /**
   * Process a payment
   * @param bookingId Booking ID
   * @param amount Payment amount
   * @param paymentMethod Payment method (card, upi, wallet)
   * @param isAdvance Whether this is an advance payment
   * @returns The created payment or null if there was an error
   */
  processPayment: async (
    bookingId: string,
    amount: number,
    paymentMethod: string,
    isAdvance: boolean = true
  ): Promise<Payment | null> => {
    try {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate a successful payment
      
      // Create a payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          is_advance: isAdvance,
          payment_gateway: 'razorpay',
          payment_gateway_response: { status: 'success' },
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update the booking payment status
      const paymentStatus = isAdvance ? 'partial' : 'completed';
      await supabase
        .from('bookings')
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      return null;
    }
  },

  /**
   * Get payments for a booking
   * @param bookingId Booking ID
   * @returns Array of payments
   */
  getBookingPayments: async (bookingId: string): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting booking payments:', error);
      return [];
    }
  },

  /**
   * Get payment by ID
   * @param paymentId Payment ID
   * @returns The payment or null if not found
   */
  getPaymentById: async (paymentId: string): Promise<Payment | null> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      return null;
    }
  },

  /**
   * Refund a payment
   * @param paymentId Payment ID
   * @returns boolean indicating success
   */
  refundPayment: async (paymentId: string): Promise<boolean> => {
    try {
      // Get the payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      if (!payment) throw new Error('Payment not found');

      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate a successful refund
      
      // Update the payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          payment_status: 'refunded',
          payment_gateway_response: { 
            ...payment.payment_gateway_response,
            refund_status: 'success',
            refunded_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Update the booking payment status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.booking_id);

      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      return false;
    }
  },

  /**
   * Initialize Razorpay payment
   * @param bookingId Booking ID
   * @param amount Payment amount (in paise/cents)
   * @param currency Currency code (e.g., INR, USD)
   * @returns Razorpay order ID or null if there was an error
   */
  initializeRazorpayPayment: async (
    bookingId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<string | null> => {
    try {
      // In a real implementation, this would call a server endpoint to create a Razorpay order
      // For now, we'll simulate a successful order creation
      
      // Generate a mock order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      return orderId;
    } catch (error) {
      console.error('Error initializing Razorpay payment:', error);
      return null;
    }
  },

  /**
   * Verify Razorpay payment
   * @param paymentId Razorpay payment ID
   * @param orderId Razorpay order ID
   * @param signature Razorpay signature
   * @returns boolean indicating success
   */
  verifyRazorpayPayment: async (
    paymentId: string,
    orderId: string,
    signature: string
  ): Promise<boolean> => {
    try {
      // In a real implementation, this would call a server endpoint to verify the payment
      // For now, we'll simulate a successful verification
      
      return true;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      return false;
    }
  },

  /**
   * Calculate fare breakdown
   * @param distance Distance in kilometers
   * @param duration Duration in minutes
   * @param vehicleType Vehicle type (sedan, suv, premium)
   * @param serviceType Service type (city, airport, outstation, hourly)
   * @returns Fare breakdown
   */
  calculateFare: (
    distance: number,
    duration: number,
    vehicleType: string,
    serviceType: string
  ): {
    base: number;
    distance: number;
    time: number;
    surge: number;
    tax: number;
    total: number;
    advancePayment: number;
    remainingPayment: number;
  } => {
    // Base fare based on vehicle type
    let baseFare = 0;
    switch (vehicleType) {
      case 'sedan':
        baseFare = 100;
        break;
      case 'suv':
        baseFare = 150;
        break;
      case 'premium':
        baseFare = 200;
        break;
      default:
        baseFare = 100;
    }
    
    // Distance fare
    const distanceRate = serviceType === 'outstation' ? 15 : 10; // Rs per km
    const distanceFare = distance * distanceRate;
    
    // Time fare
    const timeRate = 2; // Rs per minute
    const timeFare = duration * timeRate;
    
    // Surge calculation (mock for now)
    const surge = 0;
    
    // Subtotal
    const subtotal = baseFare + distanceFare + timeFare + surge;
    
    // Tax (10%)
    const tax = subtotal * 0.1;
    
    // Total
    const total = subtotal + tax;
    
    // Advance payment (25%)
    const advancePayment = total * 0.25;
    
    // Remaining payment
    const remainingPayment = total - advancePayment;
    
    return {
      base: Math.round(baseFare),
      distance: Math.round(distanceFare),
      time: Math.round(timeFare),
      surge,
      tax: Math.round(tax),
      total: Math.round(total),
      advancePayment: Math.round(advancePayment),
      remainingPayment: Math.round(remainingPayment),
    };
  },
};

export default PaymentService;