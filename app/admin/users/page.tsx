import { getUsers } from "@/lib/api/admin/user";
import { getAuthToken } from "@/lib/cookies";
import { UsersTable } from "./_components/UsersTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const token = await getAuthToken();

  const initialFilter =
    params.filter === "musician" ||
    params.filter === "organizer" ||
    params.filter === "pending"
      ? params.filter
      : "all";

  let users = [];
  let error = null;

  try {
    const userData = await getUsers(token || undefined);

    if (userData?.data?.users) {
      users = userData.data.users;
    } else if (userData?.users) {
      users = userData.users;
    } else if (Array.isArray(userData)) {
      users = userData;
    } else {
      users = [];
    }
  } catch (err: any) {
    console.error("Failed to fetch users:", err);
    error = err.message || "Failed to load users";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Manage accounts and verify musician and organizer profiles.
          </p>
        </div>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add User
        </Link>
      </div>

      {error ? (
        <div className="bg-error/10 border border-error/25 text-error px-4 py-3 rounded-xl">
          <p className="font-semibold">Error loading users</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <UsersTable
          initialUsers={users}
          token={token || undefined}
          initialFilter={initialFilter}
        />
      )}
    </div>
  );
}
