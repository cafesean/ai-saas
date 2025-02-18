'use client';

import { type RouterOutputs } from '@/utils/trpc';
import { Input } from '@/components/form/Input';
import Label from '@/components/Label';
import Textarea from '@/components/form/Textarea';
import { usePricingStore } from '../store/usePricingStore';
import { api } from '@/utils/trpc';
import { useEffect, ChangeEvent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Pricing = RouterOutputs['pricing']['getByCode'];

interface BasicInfoProps {
  pricing: Pricing;
}

export const BasicInfo = ({ pricing }: BasicInfoProps) => {
  const { setCurrentPricing, updateBasicInfo } = usePricingStore();
  const { mutate: updatePricing, isLoading: isUpdating } = api.pricing.update.useMutation();

  useEffect(() => {
    setCurrentPricing(pricing);
  }, [pricing, setCurrentPricing]);

  const handleUpdateBasicInfo = (updates: Pick<Pricing, 'code' | 'description' | 'customer_id'>) => {
    updateBasicInfo(updates);
    updatePricing({
      code: pricing.code,
      data: updates,
    });
  };

  if (isUpdating) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Code</Label>
          <Input
            value={pricing.code}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleUpdateBasicInfo({ code: e.target.value, description: pricing.description, customer_id: pricing.customer_id })
            }
            disabled={isUpdating}
          />
        </div>
        <div>
          <Label>Customer ID</Label>
          <Input
            value={pricing.customer_id}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleUpdateBasicInfo({
                code: pricing.code,
                description: pricing.description,
                customer_id: e.target.value
              })
            }
            disabled={isUpdating}
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <input
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={pricing.description}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleUpdateBasicInfo({
              code: pricing.code,
              description: e.target.value,
              customer_id: pricing.customer_id
            })
          }
          disabled={isUpdating}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Created By</Label>
          <Input value={pricing.created_by} disabled />
        </div>
        <div>
          <Label>Created At</Label>
          <Input
            value={pricing.created_at ? new Date(pricing.created_at).toLocaleDateString() : ''}
            disabled
          />
        </div>
      </div>
    </div>
  );
}; 