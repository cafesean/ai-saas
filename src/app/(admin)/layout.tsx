import { NavMenu } from "@/components/NavMenu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex h-full flex-col">
      <NavMenu />
      <main className="flex grow w-full h-0 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}