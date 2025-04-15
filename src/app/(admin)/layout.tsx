import { Suspense } from "react";

import { MobileNav } from "@/components/mobile-nav"
import { ClientSidebar } from "@/components/client-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading Application...</div>}>
      <div className="flex min-h-screen flex-col">
        <MobileNav />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r md:block">
            <ClientSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </Suspense>
  );
}
