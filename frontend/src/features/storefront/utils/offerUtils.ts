/**
 * Structured offer utilities
 * Offers like: "20% off up to ₹50 on orders above ₹100"
 * Require promo code to apply (not auto-applied)
 */

export type OfferType = 'percentage' | 'flat';

export type StructuredOffer = {
  id: string;
  type: OfferType;
  value: number;        // 20 for 20%, or 50 for ₹50 flat
  max_discount?: number; // for percentage: cap in ₹
  min_order: number;
  promo_code: string;   // e.g. "SAVE20" - required to apply
};

/** Full offer text (for checkout display) */
export function formatOfferText(offer: StructuredOffer): string {
  if (offer.type === 'percentage') {
    const base = `${offer.value}% off`;
    const cap = offer.max_discount ? ` up to ₹${offer.max_discount}` : '';
    return `${base}${cap} on orders above ₹${offer.min_order}`;
  }
  return `₹${offer.value} off on orders above ₹${offer.min_order}`;
}

/** Short text for deal card - minimal text, numbers & symbols */
export function formatOfferShort(offer: StructuredOffer): string {
  if (offer.type === 'percentage') {
    const cap = offer.max_discount ? ` ₹${offer.max_discount}` : '';
    return `${offer.value}%${cap} · Min ₹${offer.min_order}`;
  }
  return `₹${offer.value} · Min ₹${offer.min_order}`;
}

/** Compute discount amount for a given subtotal */
export function computeDiscount(offer: StructuredOffer, subtotal: number): number {
  if (subtotal < offer.min_order) return 0;

  if (offer.type === 'percentage') {
    const discount = (subtotal * offer.value) / 100;
    if (offer.max_discount) {
      return Math.min(discount, offer.max_discount);
    }
    return discount;
  }

  // Flat: cap at subtotal
  return Math.min(offer.value, subtotal);
}

/** Find offer by promo code (case-insensitive). Returns null if invalid or min_order not met. */
export function findOfferByCode(
  offers: StructuredOffer[],
  code: string,
  subtotal: number
): { offer: StructuredOffer; discount: number } | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const offer = offers.find((o) => (o.promo_code || '').trim().toUpperCase() === normalized);
  if (!offer) return null;

  const discount = computeDiscount(offer, subtotal);
  if (discount <= 0) return null;

  return { offer, discount };
}

/** Cart item with productId for eligibility lookup */
export type CartItemForEligibility = { productId: string; quantity: number; price: number; name: string };

/** Product with coupon_applicable flag */
export type ProductForEligibility = { id: string; coupon_applicable?: boolean };

/**
 * Apply offer with coupon eligibility.
 * Discount applies only to items where product.coupon_applicable !== false.
 * Returns discount amount and list of item names not eligible for coupon.
 */
export function findOfferByCodeWithEligibility(
  offers: StructuredOffer[],
  code: string,
  cartItems: CartItemForEligibility[],
  products: ProductForEligibility[]
): { offer: StructuredOffer; discount: number; nonEligibleItemNames: string[] } | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const offer = offers.find((o) => (o.promo_code || '').trim().toUpperCase() === normalized);
  if (!offer) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));
  let eligibleSubtotal = 0;
  const nonEligibleItemNames: string[] = [];

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    const isApplicable = product?.coupon_applicable !== false;
    const itemTotal = item.price * item.quantity;
    if (isApplicable) {
      eligibleSubtotal += itemTotal;
    } else {
      nonEligibleItemNames.push(item.name);
    }
  }

  const discount = computeDiscount(offer, eligibleSubtotal);
  if (discount <= 0) return null;

  return { offer, discount, nonEligibleItemNames };
}
