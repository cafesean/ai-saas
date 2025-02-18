import { api } from '@/utils/trpc';
import { usePricingStore } from '../store/usePricingStore';
import type { RouterOutputs } from '@/utils/trpc';

type PricingRole = RouterOutputs['pricing']['getByCode']['pricing_roles'][number];
type LevelRate = RouterOutputs['rateCard']['getLevelRates'][number];

export const useRateCardPrices = () => {
  const currentPricing = usePricingStore((state) => state.currentPricing);
  const updatePricingRole = usePricingStore((state) => state.updatePricingRole);

  const { data: levelRates } = api.rateCard.getLevelRates.useQuery(
    {
      ratecardId: currentPricing?.ratecard_id ?? 0,
    },
    {
      enabled: !!currentPricing,
      onSuccess: (data) => {
        // Update base prices and multipliers for all pricing roles
        currentPricing?.pricing_roles.forEach((role: PricingRole) => {
          const levelRate = data.find(
            (rate) => rate.level_rates.level_id === role.level?.id
          );

          if (levelRate) {
            updatePricingRole(role.id, {
              base_price: levelRate.level_rates.monthly_rate.toString(),
              multiplier: '1', // TODO: Get from level configuration
            });
          }
        });
      },
    }
  );

  const getRateCardPrice = (levelId: number) => {
    if (!levelRates) return null;
    
    const levelRate = levelRates.find(
      (rate) => rate.level_rates.level_id === levelId
    );

    return levelRate?.level_rates.monthly_rate ?? null;
  };

  return {
    levelRates,
    getRateCardPrice,
  };
}; 