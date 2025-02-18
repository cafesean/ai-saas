'use client';

import { type RouterOutputs } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { RoleLevelPricing } from './RoleLevelPricing';
import { OverallDiscounts } from './OverallDiscounts';
import { BasicInfo } from './BasicInfo';
import { RateCardSelection } from './RateCardSelection';
import { usePricingStore } from '../store/usePricingStore';

type Pricing = RouterOutputs['pricing']['getByCode'];
type Role = RouterOutputs['role']['getAll'][number];
type Level = RouterOutputs['level']['getAll'][number];

interface PricingFormProps {
  pricing: Pricing;
  roles: Role[];
  levels: Level[];
}

export const PricingForm = ({ pricing, roles, levels }: PricingFormProps) => {
  const currentPricing = usePricingStore((state) => state.currentPricing);
  const hasRateCard = currentPricing?.ratecard_id && currentPricing.ratecard_id > 0;

  return (
    <Tabs defaultValue="ratecard" className="space-y-6">
      <TabsList>
        <TabsTrigger value="ratecard">Rate Card</TabsTrigger>
        <TabsTrigger value="roles" disabled={!hasRateCard}>Role-Level Pricing</TabsTrigger>
        <TabsTrigger value="discounts" disabled={!hasRateCard}>Overall Discounts</TabsTrigger>
        <TabsTrigger value="info" disabled={!hasRateCard}>Basic Info</TabsTrigger>
      </TabsList>

      <TabsContent value="ratecard">
        <Card>
          <CardHeader>
            <CardTitle>Select Rate Card</CardTitle>
          </CardHeader>
          <CardContent>
            <RateCardSelection pricing={pricing} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="roles">
        <Card>
          <CardHeader>
            <CardTitle>Role-Level Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleLevelPricing
              pricing={pricing}
              roles={roles}
              levels={levels}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="discounts">
        <Card>
          <CardHeader>
            <CardTitle>Overall Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <OverallDiscounts pricing={pricing} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <BasicInfo pricing={pricing} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}; 