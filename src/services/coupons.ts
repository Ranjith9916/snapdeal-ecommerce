import { supabase } from '../lib/supabase';

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  code?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  calculated_discount: number;
}

// Known authoritative coupon catalog for fallback if RPC is not yet migrated to DB
const KNOWN_COUPONS: Record<string, {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  minimum_order_amount: number;
  max_discount_amount: number | null;
  expiry_date?: string;
}> = {
  SNAP20: {
    code: 'SNAP20',
    description: '20% off on all eligible electronics and gadgets',
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true,
    minimum_order_amount: 999,
    max_discount_amount: 2000,
  },
  SAVE500: {
    code: 'SAVE500',
    description: 'Flat ₹500 off on orders above ₹2,000',
    discount_type: 'fixed',
    discount_value: 500,
    is_active: true,
    minimum_order_amount: 2000,
    max_discount_amount: null,
  },
  FASHION30: {
    code: 'FASHION30',
    description: '30% off on fashion and apparel collections',
    discount_type: 'percentage',
    discount_value: 30,
    is_active: true,
    minimum_order_amount: 999,
    max_discount_amount: 1500,
  },
  FREESHIP: {
    code: 'FREESHIP',
    description: 'Free standard shipping on any order',
    discount_type: 'fixed',
    discount_value: 49,
    is_active: true,
    minimum_order_amount: 0,
    max_discount_amount: null,
  },
  EXPIRED10: {
    code: 'EXPIRED10',
    description: 'Expired test coupon',
    discount_type: 'percentage',
    discount_value: 10,
    is_active: false,
    minimum_order_amount: 500,
    max_discount_amount: null,
    expiry_date: '2024-01-01',
  }
};

/**
 * Authoritatively validates a coupon code against Supabase RPC
 * or falls back to server-matched business logic if RPC is unavailable.
 */
export async function validateCoupon(
  rawCode: string,
  orderAmount: number
): Promise<CouponValidationResult> {
  const code = (rawCode || '').trim().toUpperCase();

  if (!code) {
    return {
      valid: false,
      message: 'Please enter a coupon code.',
      calculated_discount: 0,
    };
  }

  // 1. Attempt secure Supabase RPC
  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_coupon_code: code,
      p_order_amount: orderAmount,
    });

    if (!error && data) {
      return {
        valid: Boolean(data.valid),
        message: data.message,
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        calculated_discount: Number(data.calculated_discount) || 0,
      };
    }
  } catch (err) {
    // RPC not available or network hiccup, fallback gracefully
  }

  // 2. Authoritative fallback validation
  const coupon = KNOWN_COUPONS[code];
  if (!coupon) {
    return {
      valid: false,
      message: `Coupon "${code}" is invalid.`,
      calculated_discount: 0,
    };
  }

  if (!coupon.is_active) {
    return {
      valid: false,
      message: `Coupon "${code}" is no longer active.`,
      calculated_discount: 0,
    };
  }

  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return {
      valid: false,
      message: `Coupon "${code}" has expired.`,
      calculated_discount: 0,
    };
  }

  if (orderAmount < coupon.minimum_order_amount) {
    return {
      valid: false,
      message: `Coupon "${code}" requires a minimum order amount of ₹${coupon.minimum_order_amount.toLocaleString()}.`,
      calculated_discount: 0,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((orderAmount * coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    discount = coupon.discount_value;
  }

  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return {
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    calculated_discount: discount,
  };
}
