'use client';
import { ChangeEvent } from 'react'
import { type RouterOutputs } from '@/utils/trpc';
import { Button } from '@/components/form/Button';
import { Input } from '@/components/form/Input';
import Label from '@/components/Label';
import { Loader2, Plus, Trash } from 'lucide-react';
import { usePricingStore } from '../store/usePricingStore';
import { api } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';

type Pricing = RouterOutputs['pricing']['getByCode'];

interface BasicInfoProps {
  pricing: Pricing;
}

export const OverallDiscounts = ({ pricing }: BasicInfoProps) => {
  const { currentPricing, addOverallDiscount, removeOverallDiscount, updateOverallDiscounts } = usePricingStore();
  const { mutate: updatePricing, isLoading: isUpdating } = api.pricing.update.useMutation();

  if (!currentPricing) return null;

  const discounts = (currentPricing.overall_discounts ?? []) as Array<{ rate: number; }>;

  const handleDiscountChange = (index: number, value: string) => {
    const newDiscounts = [...discounts];
    newDiscounts[index] = { rate: Number(value) / 100 };
    updateOverallDiscounts(newDiscounts);
    updatePricing({
      code: currentPricing.code,
      data: { overall_discounts: newDiscounts },
    });
  };

  const handleAddDiscount = () => {
    addOverallDiscount(0);
    updatePricing({
      code: currentPricing.code,
      data: { overall_discounts: [...discounts, { rate: 0 }] },
    });
  };

  const handleRemoveDiscount = (index: number) => {
    removeOverallDiscount(index);
    updatePricing({
      code: currentPricing.code,
      data: { overall_discounts: discounts.filter((_, i) => i !== index) },
    });
  };

  if (isUpdating) {
    return (
      <div className="space-y-4">
        {discounts.map((_, index) => (
          <div key={index} className="flex items-end gap-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discounts.map((discount, index) => (
        <div key={index} className="flex items-end gap-4">
          <div className="flex-1">
            <Label>Discount Rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={discount.rate * 100}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleDiscountChange(index, e.target.value)}
              disabled={isUpdating}
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleRemoveDiscount(index)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={handleAddDiscount}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Add Discount
      </Button>
    </div>
  );
}; 