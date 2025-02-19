'use client';

import { api } from '@/utils/trpc';
import { useRouter } from 'next/navigation';
import { PricingForm } from '../components/PricingForm';
import { Button } from '@/components/form/Button'; import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePricingStore } from '../store/usePricingStore';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function NewPricingClient() {
  const router = useRouter();
  const { data: roles, isLoading: isRolesLoading } = api.role.getAll.useQuery();
  const { data: levels, isLoading: isLevelsLoading } = api.level.getAll.useQuery();
  const { data: rateCards, isLoading: isRateCardsLoading } = api.rateCard.getAll.useQuery();
  const { setCurrentPricing } = usePricingStore();

  const isLoading = isRolesLoading || isLevelsLoading || isRateCardsLoading;

  // Initialize empty pricing
  useEffect(() => {
    if (!rateCards) return;

    const emptyPricing = {
      id: -1,
      code: '',
      description: '',
      customer_id: '',
      ratecard_id: rateCards[0]?.id ?? 0,
      overall_discounts: [],
      total_amount: '0',
      resource_count: 0,
      created_by: 'system',
      pricing_roles: [],
      ratecard: rateCards[0] ?? null,
      created_at: null,
    };

    setCurrentPricing(emptyPricing);
  }, [rateCards, setCurrentPricing]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!roles || !levels || !rateCards) {
    return null;
  }

  const emptyPricing = {
    id: -1,
    uuid: uuidv4(),
    code: '',
    description: '',
    customer_id: '',
    ratecard_id: rateCards[0]?.id ?? 0,
    overall_discounts: [],
    total_amount: '0',
    resource_count: 0,
    created_by: 'system',
    created_at: new Date(),
    updated_at: new Date(),
    pricing_roles: [],
    ratecard: rateCards[0] ?? null,
  };

  return (
    <div className="container mx-auto py-6">
      <div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg">
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create Pricing
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new pricing for a customer
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <PricingForm
          pricing={emptyPricing}
          roles={roles}
          levels={levels}
        />
      </div>
    </div>
  );
} 