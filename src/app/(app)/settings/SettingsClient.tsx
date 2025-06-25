"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionManagement } from "@/components/settings/SessionManagement";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { User, Shield, Settings as SettingsIcon } from "lucide-react";

type SettingsTab = "profile" | "security" | "preferences";

export function SettingsClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Set initial tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'security' || tab === 'preferences')) {
      setActiveTab(tab as SettingsTab);
    }
  }, [searchParams]);

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="preferences" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          Preferences
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-6">
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SessionManagement />
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSettings />
        </TabsContent>
      </div>
    </Tabs>
  );
}