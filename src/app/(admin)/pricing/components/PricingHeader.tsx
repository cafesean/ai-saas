import { Button } from '@/components/form/Button';import { Plus } from 'lucide-react';
import Link from 'next/link';

export function PricingHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Manage pricing for customers
        </p>
      </div>
      <Link href="/pricing/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Pricing
        </Button>
      </Link>
    </div>
  );
} 