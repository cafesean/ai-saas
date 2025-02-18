import { type Metadata } from 'next';
import { PricingDetailClient } from './PricingDetailClient';

export const metadata: Metadata = {
  title: 'Pricing Details',
  description: 'View and edit pricing details',
};

export default function PricingDetailPage() {
  return <PricingDetailClient />;
} 