'use client';

import { type NextPage } from 'next';
import { api } from '@/utils/trpc';
import { PricingTable } from './components/PricingTable';
import { PricingHeader } from './components/PricingHeader';

const PricingPage: NextPage = () => {
  const { data: pricings, isLoading } = api.pricing.getAll.useQuery({
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PricingHeader />
      <div className="mt-6">
        <PricingTable initialData={pricings} />
      </div>
    </div>
  );
};

export default PricingPage; 