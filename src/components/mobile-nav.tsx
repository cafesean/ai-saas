"use client";

import { useState } from "react";
import Link from "next/link";
import { type Route } from "next";
import { Menu, Brain, LogOut, User, Settings, Building2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { SampleButton } from "@/components/ui/sample-button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutConfirmDialog } from "@/components/auth/SignOutConfirmDialog";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session } = useSession();

  const handleLogoutClick = () => {
    setShowSignOutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowSignOutDialog(false);
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <SampleButton variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SampleButton>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="pt-6">
            <Sidebar setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Model Hub</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        
        {/* Organization Button - Ghost style */}
        {session?.user && (session.user as any).currentOrg && (
          <SampleButton 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            asChild
          >
            <Link href="/organizations">
              <Building2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">
                {(session.user as any).currentOrg.name}
              </span>
            </Link>
          </SampleButton>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SampleButton variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>
                  {session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                   session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </SampleButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={"/settings?tab=preferences" as Route} className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogoutClick}
              className="flex items-center text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SignOutConfirmDialog
        isOpen={showSignOutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={isSigningOut}
      />
    </header>
  );
}
