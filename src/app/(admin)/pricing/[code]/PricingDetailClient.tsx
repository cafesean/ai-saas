'use client';

import { api } from '@/utils/trpc';
import { notFound, useParams } from 'next/navigation';
import { PricingForm } from '../components/PricingForm';
import { PricingDetailHeader } from '../components/PricingDetailHeader';
// import { Skeleton } from '@/components/ui/Skeleton';

export function PricingDetailClient() {
  const { code } = useParams();
  const { data: pricing, isLoading: isPricingLoading } = api.pricing.getByCode.useQuery(code as string);
  const { data: roles, isLoading: isRolesLoading } = api.role.getAll.useQuery();
  const { data: levels, isLoading: isLevelsLoading } = api.level.getAll.useQuery();

  const isLoading = isPricingLoading || isRolesLoading || isLevelsLoading;

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

  if (!pricing || !roles || !levels) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <PricingDetailHeader pricing={pricing} />
      <div className="mt-6">
        <PricingForm
          pricing={pricing}
          roles={roles}
          levels={levels}
        />
      </div>
    </div>
  );
} 