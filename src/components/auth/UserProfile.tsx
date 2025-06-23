import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  Building2
} from 'lucide-react';
import Link from 'next/link';

export function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const currentOrg = (user as any).currentOrg;
  const userInitials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                      user.email?.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-2">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={user.avatar} alt={user.name || 'User'} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <div className="text-sm font-medium truncate w-full">
              {user.name || user.email}
            </div>
            {currentOrg && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 mr-1" />
                <span className="truncate">{currentOrg.name}</span>
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                <AvatarFallback className="text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {user.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            
            {currentOrg && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {currentOrg.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Current Organization
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(user as any).availableOrgs && (user as any).availableOrgs.length > 1 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Available Organizations: {(user as any).availableOrgs.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(user as any).availableOrgs.slice(0, 3).map((org: any) => (
                    <Badge key={org.id} variant="outline" className="text-xs">
                      {org.name}
                    </Badge>
                  ))}
                  {(user as any).availableOrgs.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(user as any).availableOrgs.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/users" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/users" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        {(user as any).availableOrgs && (user as any).availableOrgs.length > 1 && (
          <DropdownMenuItem asChild>
            <Link href="/organizations" className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              <span>Switch Organization</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserProfile; 