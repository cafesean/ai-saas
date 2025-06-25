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
import { Building2 } from 'lucide-react';
import { api } from '@/utils/trpc';
import { toast } from 'sonner';

export function OrgSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const switchOrgMutation = api.auth.switchOrg.useMutation();

  const currentOrg = (session?.user as any)?.currentOrg;
  const availableOrgs = (session?.user as any)?.availableOrgs || [];

  const handleOrgSwitch = async (orgId: string) => {
    try {
      const result = await switchOrgMutation.mutateAsync({
        orgId: parseInt(orgId)
      });

      if (result.success) {
        // Update the session with new org data
        await update();
        
        toast.success(`Switched to ${result.org.name}`);
        
        // Refresh the page to reload with new org context
        router.refresh();
      } else {
        toast.error((result as any).error || 'Failed to switch org');
      }
    } catch (error) {
      console.error('Error switching org:', error);
      toast.error('Failed to switch org');
    }
  };

  if (!session?.user || availableOrgs.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentOrg?.id?.toString()}
        onValueChange={handleOrgSwitch}
        disabled={switchOrgMutation.isPending}
      >
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span className="truncate">
                {currentOrg?.name || 'Select Org'}
              </span>
              {currentOrg && (
                <Badge variant="secondary" className="text-xs">
                  {availableOrgs
                    .find((org: any) => org.id === currentOrg.id)
                    ?.roles.join(', ') || ''}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableOrgs.map((org: any) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{org.name}</span>
                  {org.isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Roles: {org.roles.join(', ')}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default OrgSwitcher; 