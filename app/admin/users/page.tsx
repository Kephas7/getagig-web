import { getUsers } from "@/lib/api/admin/user";
import { getAuthToken } from "@/lib/cookies";
import { UsersTable } from "./_components/UsersTable";
import Link from "next/link";
import { Plus } from "lucide-react";


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersPage() {
  const token = await getAuthToken();
  
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link 
          href="/admin/users/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add User
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error loading users</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <UsersTable initialUsers={users} token={token || undefined} />
      )}
    </div>
  );
}
