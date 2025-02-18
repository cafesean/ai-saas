import { type RouterOutputs } from '@/utils/trpc';
import { Button } from '@/components/form/Button'; import { ArrowLeft, Trash } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/framework/lib/utils';

type Pricing = RouterOutputs['pricing']['getByCode'];

interface PricingDetailHeaderProps {
  pricing: Pricing;
}

export const PricingDetailHeader = ({ pricing }: PricingDetailHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="lg">
          <Link href="/pricing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {pricing.code}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pricing.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">Total Amount</div>
            <div className="text-2xl font-semibold">
              {formatCurrency(Number(pricing.total_amount))}
            </div>
          </div>
          <Button variant="primary" size="lg">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div>
          Customer ID: <span className="font-medium">{pricing.customer_id}</span>
        </div>
        <div>•</div>
        <div>
          Rate Card: <span className="font-medium">{pricing.ratecard?.name ?? 'N/A'}</span>
        </div>
        <div>•</div>
        <div>
          Resources: <span className="font-medium">{pricing.resource_count}</span>
        </div>
      </div>
    </div>
  );
}; 