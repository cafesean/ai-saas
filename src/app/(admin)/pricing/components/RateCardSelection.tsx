'use client';

import { type RouterOutputs } from '@/utils/trpc';
import { api } from '@/utils/trpc';
import { SelectField } from '@/components/form/SelectField';
import { usePricingStore } from '../store/usePricingStore';
import { Card } from '@/components/Card';
import Label from '@/components/Label';
import Link from 'next/link';
import { Button } from '@/components/form/Button';import { Plus } from 'lucide-react';

type Pricing = RouterOutputs['pricing']['getByCode'];

interface RateCardSelectionProps {
  pricing: Pricing;
}

export function RateCardSelection({ pricing }: RateCardSelectionProps) {
  const { data: rateCards } = api.rateCard.getAll.useQuery();
  const { currentPricing, updateBasicInfo } = usePricingStore();

  const handleRateCardChange = (value: string) => {
    const selectedRateCard = rateCards?.find((r) => r.id === Number(value));
    if (!selectedRateCard) return;

    updateBasicInfo({
      ratecard_id: selectedRateCard.id,
      ratecard: {
        id: selectedRateCard.id,
        uuid: selectedRateCard.uuid,
        name: selectedRateCard.name,
        description: selectedRateCard.description,
        effective_date: new Date(selectedRateCard.effective_date),
        expire_date: selectedRateCard.expire_date ? new Date(selectedRateCard.expire_date) : null,
        created_at: null,
        updated_at: null,
      },
    });
  };

  if (!rateCards || !currentPricing) return null;

  const options = rateCards.map((rateCard) => ({
    value: String(rateCard.id),
    label: rateCard.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Rate Card</Label>
          <SelectField
            value={String(currentPricing.ratecard_id)}
            onValueChange={handleRateCardChange}
            options={options}
            placeholder="Select rate card"
          />
        </div>
        <Button variant="outline" size="sm">
          <Link href="/rate-cards">
            <Plus className="h-4 w-4 mr-2" />
            Create Rate Card
          </Link>
        </Button>
      </div>

      {currentPricing.ratecard && (
        <Card className="p-4 bg-gray-50">
          <h3 className="text-xs font-semibold tracking-wide uppercase mb-3">Selected Rate Card Details</h3>
          <div className="space-y-1.5">
            <div className="flex">
              <span className="text-sm text-muted-foreground w-24">Name:</span>
              <span className="text-sm">{currentPricing.ratecard.name}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-muted-foreground w-24">Description:</span>
              <span className="text-sm">{currentPricing.ratecard.description}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-muted-foreground w-24">Effective Date:</span>
              <span className="text-sm">{new Date(currentPricing.ratecard.effective_date).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 