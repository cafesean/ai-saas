import { type Metadata } from 'next';
import { Suspense } from 'react';
import { SettingsClient } from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings - AI SaaS Platform',
  description: 'Manage your account settings, security preferences, and application configuration',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings, security preferences, and application configuration.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="space-y-6">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>
        }>
          <SettingsClient />
        </Suspense>
      </div>
    </div>
  );
}