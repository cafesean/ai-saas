import { NavMenu } from "@/components/NavMenu";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex h-full flex-col">
      <NavMenu />
      <Sidebar />
      <main className="flex grow sm:ml-64 h-0 p-4 sm:p-4 lg:p-4 overflow-auto">
        <div className="flex grow mt-14">{children}</div>
      </main>
    </div>
  );
}
