import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
