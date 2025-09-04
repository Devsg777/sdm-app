declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  interface RazorpayError {
    code: number;
    description: string;
    metadata?: any;
  }

  export default class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  }
}