import { Suspense } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ClientSidebar } from "@/components/client-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({
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
          <div className="flex flex-1">
            <aside className="hidden w-64 border-r md:block">
              <ClientSidebar />
            </aside>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </Suspense>
    </AuthGuard>
  );
}
