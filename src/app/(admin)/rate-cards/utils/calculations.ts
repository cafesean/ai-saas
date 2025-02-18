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
export const calculateRoleTotal = (role: PricingRole): number => {
  const baseAmount = role.override_price || calculateWeightedPrice(role.base_price, role.multiplier);
  const discounts = [
    ...(role.discountRate ? [role.discountRate] : []),
  ];
  return calculateFinalPrice(baseAmount, discounts) * role.quantity;
};

/**
 * Calculate total amount for all pricing roles with overall discounts
 */
export const calculatePricingTotal = (
  roles: PricingRole[],
  overallDiscounts: Array<{ rate: number }> = []
): number => {
  const subtotal = roles.reduce((acc, role) => acc + calculateRoleTotal(role), 0);
  return calculateFinalPrice(subtotal, overallDiscounts.map(d => d.rate));
};

/**
 * Calculate resource count for all pricing roles
 */
export const calculateResourceCount = (roles: PricingRole[]): number => {
  return roles.reduce((acc, role) => acc + role.quantity, 0);
}; 