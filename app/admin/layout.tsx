import { Suspense } from "react";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";
import { getAuthToken, getUserData } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, user] = await Promise.all([getAuthToken(), getUserData()]);

  if (!token || !user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col">
        <div className="md:hidden">
          <AdminHeader />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
