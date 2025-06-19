import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown } from 'lucide-react';
import { api } from '@/utils/trpc';
import { toast } from 'sonner';

interface TenantInfo {
  id: number;
  name: string;
  roles: string[];
  isActive: boolean;
}

export function TenantSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const switchTenantMutation = api.auth.switchTenant.useMutation();

  const currentTenant = session?.user?.currentTenant;
  const availableTenants = session?.user?.availableTenants || [];

  const handleTenantSwitch = async (tenantId: string) => {
    try {
      const result = await switchTenantMutation.mutateAsync({
        tenantId: parseInt(tenantId)
      });

      if (result.success) {
        // Update the session with new tenant data
        await update();
        
        toast.success(`Switched to ${result.tenant.name}`);
        
        // Refresh the page to reload with new tenant context
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to switch tenant');
      }
    } catch (error) {
      console.error('Error switching tenant:', error);
      toast.error('Failed to switch tenant');
    }
  };

  if (!session?.user || availableTenants.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentTenant?.id?.toString()}
        onValueChange={handleTenantSwitch}
        disabled={switchTenantMutation.isLoading}
      >
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span className="truncate">
                {currentTenant?.name || 'Select Tenant'}
              </span>
              {currentTenant && (
                <Badge variant="secondary" className="text-xs">
                  {availableTenants
                    .find(t => t.id === currentTenant.id)
                    ?.roles.join(', ') || ''}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableTenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id.toString()}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{tenant.name}</span>
                  {tenant.isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Roles: {tenant.roles.join(', ')}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default TenantSwitcher; 