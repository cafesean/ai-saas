import { Suspense } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ClientSidebar } from "@/components/client-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard
      fallback={
        <div className="flex w-screen h-screen justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Checking authentication...</span>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex w-screen h-screen justify-center items-center">
            Loading Application...
          </div>
        }
      >
        <div className="flex min-h-screen flex-col">
          <MobileNav />
          {/* Fixed sidebar - only show on desktop */}
          <div className="hidden md:block">
            <ClientSidebar />
          </div>
          {/* Main content with left margin for fixed sidebar */}
          <main className="flex-1 md:ml-64">
            {children}
          </main>
        </div>
      </Suspense>
    </AuthGuard>
  );
} 