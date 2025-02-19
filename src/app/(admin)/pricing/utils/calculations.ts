import { type PricingRole } from '../types/schema';

/**
 * Calculate the weighted price based on the base price and multiplier
 */
export const calculateWeightedPrice = (basePrice: number, multiplier: number): number => {
  return basePrice * (1 + multiplier);
};

/**
 * Calculate the final price after applying discounts
 */
export const calculateFinalPrice = (price: number, discounts: number[]): number => {
  return discounts.reduce((acc, discount) => acc * (1 - discount), price);
};
/**
 * Calculate the variance percentage between two prices
 */
export const calculateVariance = (basePrice: number, overridePrice: number): number => {
  return ((overridePrice - basePrice) / basePrice) * 100;
};

/**
 * Calculate total amount for a pricing role
 */
export const calculateRoleTotal = (role: {
  // id: number;
  pricing_id: number| null;
  role_id: number| null;
  level_id: number| null;
  quantity: number;
  base_price: string | null;
  multiplier: string | null;
  final_price: string | null;
  discount_rate?: string | null;
  override_price?: string | null;
  role: { id: number; name: string; /* ... */ }| null;
  level: { id: number; name: string; /* ... */ }| null;
}): number => {
  const baseAmount = role.override_price ? parseFloat(role.override_price) : calculateWeightedPrice(parseFloat(role.base_price ?? '0'), parseFloat(role.multiplier ?? '1'));
  const discounts = [
    ...(role.discount_rate ? [role.discount_rate] : []),
  ];
  return calculateFinalPrice(baseAmount, discounts.map(rate => parseFloat(rate ?? '0'))) * role.quantity;
};

/**
 * Calculate total amount for all pricing roles with overall discounts
 */
export function calculatePricingTotal(
  roles: Array<{
    // id: number;
    pricing_id: number | null;
    role_id: number | null;
    level_id: number | null;
    quantity: number;
    base_price: string | null;
    multiplier: string | null;
    final_price: string | null;
    discount_rate?: string | null;
    role: { id: number; name: string; /* ... */ } | null;
    level: { id: number; name: string; /* ... */ } | null;
  }>,
  overallDiscounts: Array<{ rate: number }> | null
) {
  const subtotal = roles.reduce((acc, role) => acc + calculateRoleTotal(role), 0);
  if (!overallDiscounts || overallDiscounts === null) {
    return subtotal;
  }
  return calculateFinalPrice(subtotal, overallDiscounts.map((d: { rate: number }) => d.rate));
}

/**
 * Calculate resource count for all pricing roles
 */
export const calculateResourceCount = (
  roles: Array<{
    // id: number;
    pricing_id: number | null;
    role_id: number | null;
    level_id: number | null;
    quantity: number;
    base_price: string | null;
    multiplier: string | null;
    final_price: string | null;
    discount_rate?: string | null;
    role: { id: number; name: string; /* ... */ } | null;
    level: { id: number; name: string; /* ... */ } | null;
  }>
): number => {
  return roles.reduce((acc, role) => acc + role.quantity, 0);
}; 