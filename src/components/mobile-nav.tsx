"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Brain } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <SampleButton variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SampleButton>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 pt-6">
          <Sidebar setOpen={setOpen} />
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Model Hub</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SampleButton variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="@user"
                />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            </SampleButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Mohammed Al-Farsi
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  m.alfarsi@example.sa
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
