import { type Metadata } from 'next';
import { NewPricingClient } from './NewPricingClient';

export const metadata: Metadata = {
  title: 'Create Pricing',
  description: 'Create a new pricing',
};

export default function NewPricingPage() {
  return <NewPricingClient />;
} 