import { create } from 'zustand';
import { type RouterOutputs } from '@/utils/trpc';
import { calculatePricingTotal, calculateResourceCount } from '../utils/calculations';

type Pricing = RouterOutputs['pricing']['getByCode'];
type PricingRole = Pricing['pricing_roles'][number];
type OverallDiscount = { rate: number };

interface PricingStore {
  // State
  currentPricing: Pricing | null;
  isDirty: boolean;

  // Actions
  setCurrentPricing: (pricing: Pricing) => void;
  updateBasicInfo: (updates: Partial<Pricing>) => void;
  updatePricingRole: (roleId: number, updates: Partial<PricingRole>) => void;
  addPricingRole: (role: Omit<PricingRole, 'id' | 'uuid' | 'pricingId'>) => void;
  removePricingRole: (roleId: number) => void;
  updateOverallDiscounts: (discounts: OverallDiscount[]) => void;
  addOverallDiscount: (rate: number) => void;
  removeOverallDiscount: (index: number) => void;
  calculateTotals: () => void;
  reset: () => void;
}

export const usePricingStore = create<PricingStore>((set, get) => {
  // Helper function to update pricing and mark as dirty
  const updatePricing = (updater: (pricing: Pricing) => Pricing) => {
    const currentPricing = get().currentPricing;
    if (!currentPricing) return;

    set({
      currentPricing: updater(currentPricing),
      isDirty: true,
    });
  };

  // Helper function to update and recalculate totals
  const updateAndRecalculate = (updater: (pricing: Pricing) => Pricing) => {
    updatePricing(updater);
    get().calculateTotals();
  };

  // Helper function to handle overall discounts
  const getOverallDiscounts = (pricing: Pricing): OverallDiscount[] => 
    (pricing.overall_discounts ?? []) as OverallDiscount[];

  return {
    // State
    currentPricing: null,
    isDirty: false,

    // Actions
    setCurrentPricing: (pricing) => {
      set({ currentPricing: pricing, isDirty: false });
    },

    updateBasicInfo: (updates) => {
      updatePricing((pricing) => ({ ...pricing, ...updates }));
    },

    updatePricingRole: (roleId, updates) => {
      updateAndRecalculate((pricing) => ({
        ...pricing,
        pricing_roles: pricing.pricing_roles.map((role) =>
          role.id === roleId ? { ...role, ...updates } : role
        ),
      }));
    },

    addPricingRole: (role) => {
      updateAndRecalculate((pricing) => {
        const tempId = Math.min(...pricing.pricing_roles.map((r) => r.id)) - 1;
        const newRole: PricingRole = {
          ...role,
          id: tempId,
          // uuid: '',
          pricing_id: pricing.id,
        };

        return {
          ...pricing,
          pricing_roles: [...pricing.pricing_roles, newRole],
        };
      });
    },

    removePricingRole: (roleId) => {
      updateAndRecalculate((pricing) => ({
        ...pricing,
        pricing_roles: pricing.pricing_roles.filter((role) => role.id !== roleId),
      }));
    },

    updateOverallDiscounts: (discounts) => {
      updateAndRecalculate((pricing) => ({
        ...pricing,
        overall_discounts: discounts,
      }));
    },

    addOverallDiscount: (rate) => {
      updateAndRecalculate((pricing) => ({
        ...pricing,
        overall_discounts: [...getOverallDiscounts(pricing), { rate }],
      }));
    },

    removeOverallDiscount: (index) => {
      updateAndRecalculate((pricing) => ({
        ...pricing,
        overall_discounts: getOverallDiscounts(pricing).filter((_, i) => i !== index),
      }));
    },

    calculateTotals: () => {
      const currentPricing = get().currentPricing;
      if (!currentPricing) return;

      const total_amount = calculatePricingTotal(
        currentPricing.pricing_roles,
        getOverallDiscounts(currentPricing)
      );

      const resource_count = calculateResourceCount(currentPricing.pricing_roles);

      set({
        currentPricing: {
          ...currentPricing,
          total_amount: total_amount.toString(),
          resource_count,
        },
      });
    },

    reset: () => {
      set({ currentPricing: null, isDirty: false });
    },
  };
}); 