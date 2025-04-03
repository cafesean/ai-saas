import { NavMenu } from "@/components/NavMenu";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex h-full flex-col">
      <NavMenu />
      <Sidebar />
      <main className="flex grow sm:ml-64 h-0 px-4 pb-0 sm:p-4 sm:pb-0 lg:p-4 lg:pb-0 overflow-y-auto">
        <div className="flex grow">{children}</div>
      </main>
    </div>
  );
}
