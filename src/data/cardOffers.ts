export interface CardOffer {
  id: string
  bank: string
  bankCode: 'hdfc' | 'icici' | 'sbi' | 'axis' | 'bob' | 'kotak'
  cardType: string
  discountText: string
  description: string
  minSpend: number
  discountPercentage?: number
  maxDiscount?: number
  flatDiscount?: number
  couponCode: string
  icon: string
  badgeColor: string
  terms: string[]
}

export const CARD_OFFERS: CardOffer[] = [
  {
    id: 'hdfc-10',
    bank: 'HDFC Bank',
    bankCode: 'hdfc',
    cardType: 'Credit & Debit Cards',
    discountText: '10% Instant Discount up to ₹1,500',
    description: 'Get 10% instant discount on HDFC Bank Credit & Debit Card EMI & Non-EMI transactions.',
    minSpend: 2499,
    discountPercentage: 10,
    maxDiscount: 1500,
    couponCode: 'HDFC10',
    icon: '🏛️',
    badgeColor: '#004c8f',
    terms: [
      'Minimum cart value must be ₹2,499.',
      'Maximum discount capped at ₹1,500 per card.',
      'Applicable on both full swipe and EMI transactions.',
      'Offer valid once per user during the festive period.',
    ],
  },
  {
    id: 'icici-750',
    bank: 'ICICI Bank',
    bankCode: 'icici',
    cardType: 'Credit Card Only',
    discountText: 'Flat ₹750 Instant Discount',
    description: 'Flat ₹750 discount on ICICI Bank Credit Card purchases on fashion, shoes, electronics and lifestyle.',
    minSpend: 3999,
    flatDiscount: 750,
    couponCode: 'ICICI750',
    icon: '💳',
    badgeColor: '#b53229',
    terms: [
      'Minimum order value of ₹3,999 required.',
      'Flat ₹750 deducted instantly at checkout.',
      'Not applicable on ICICI Corporate/Commercial Cards.',
    ],
  },
  {
    id: 'sbi-5',
    bank: 'SBI Card',
    bankCode: 'sbi',
    cardType: 'Credit Cards',
    discountText: '5% Instant Cashback up to ₹500',
    description: 'Save 5% instant cashback on all online purchases using SBI Credit Cards with zero minimum spend restrictions.',
    minSpend: 999,
    discountPercentage: 5,
    maxDiscount: 500,
    couponCode: 'SBISAVE',
    icon: '🏦',
    badgeColor: '#0087cb',
    terms: [
      'Valid on minimum order value of ₹999.',
      'Max discount is ₹500 per transaction.',
      'Applies across all apparel, footwear, and accessories.',
    ],
  },
  {
    id: 'axis-10',
    bank: 'Axis Bank',
    bankCode: 'axis',
    cardType: 'Credit & Debit Cards',
    discountText: '10% Off + No Cost EMI up to 6M',
    description: '10% Instant Discount up to ₹1,250 on Axis Bank Credit Cards, plus eligible for 3 or 6 months No Cost EMI.',
    minSpend: 2999,
    discountPercentage: 10,
    maxDiscount: 1250,
    couponCode: 'AXIS10',
    icon: '🏛️',
    badgeColor: '#97144d',
    terms: [
      'Minimum cart value must be ₹2,999.',
      'No Cost EMI available on select tenures.',
      'Cannot be clubbed with corporate discount vouchers.',
    ],
  },
  {
    id: 'bob-5',
    bank: 'Snapdeal BoB Card',
    bankCode: 'bob',
    cardType: 'Co-Branded Credit Card',
    discountText: '5% Unlimited Cashback + ₹250 Welcome Reward',
    description: 'Earn 5% unlimited cashback points on every purchase with the official Snapdeal Bank of Baroda Credit Card.',
    minSpend: 499,
    discountPercentage: 5,
    maxDiscount: 2000,
    couponCode: 'BOB5',
    icon: '✨',
    badgeColor: '#f26522',
    terms: [
      'Unlimited 5% cashback credited as shopping points.',
      'Valid on all items with no minimum purchase ceiling.',
    ],
  },
  {
    id: 'kotak-400',
    bank: 'Kotak Bank',
    bankCode: 'kotak',
    cardType: 'Debit & Credit Cards',
    discountText: 'Flat ₹400 Instant Discount',
    description: 'Flat ₹400 off on Kotak Mahindra Bank Debit & Credit Card transactions.',
    minSpend: 1999,
    flatDiscount: 400,
    couponCode: 'KOTAK400',
    icon: '💳',
    badgeColor: '#ed1c24',
    terms: [
      'Minimum transaction amount of ₹1,999.',
      'Instant deduction on card details verification.',
    ],
  },
]

export function calculateCardDiscount(price: number, offer: CardOffer): number {
  if (price < offer.minSpend) return 0
  if (offer.flatDiscount) {
    return Math.min(offer.flatDiscount, price)
  }
  if (offer.discountPercentage) {
    const rawDiscount = Math.round((price * offer.discountPercentage) / 100)
    return offer.maxDiscount ? Math.min(rawDiscount, offer.maxDiscount) : rawDiscount
  }
  return 0
}

export function getBestCardOffer(price: number): { offer: CardOffer; savings: number; effectivePrice: number } | null {
  let bestOffer: CardOffer | null = null
  let maxSavings = 0

  for (const offer of CARD_OFFERS) {
    const savings = calculateCardDiscount(price, offer)
    if (savings > maxSavings) {
      maxSavings = savings
      bestOffer = offer
    }
  }

  if (bestOffer && maxSavings > 0) {
    return {
      offer: bestOffer,
      savings: maxSavings,
      effectivePrice: Math.max(0, price - maxSavings),
    }
  }

  // If price is below thresholds, pick HDFC as standard reference
  const fallback = CARD_OFFERS[0]
  const sampleSavings = Math.round((price * (fallback.discountPercentage || 10)) / 100)
  return {
    offer: fallback,
    savings: sampleSavings,
    effectivePrice: Math.max(0, price - sampleSavings),
  }
}
