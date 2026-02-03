"use client";

import { User } from "../schema";
import { useState } from "react";
import { deleteUser } from "@/lib/api/admin/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Shield, Music, Calendar } from "lucide-react";

interface UsersTableProps {
  initialUsers: User[];
  token?: string;
}

export function UsersTable({ initialUsers, token }: UsersTableProps) {
  
  const [users, setUsers] = useState<User[]>(Array.isArray(initialUsers) ? initialUsers : []);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(id);
    try {
      await deleteUser(id, token);
      setUsers(users.filter((user) => (user.id || user._id) !== id));
      router.refresh(); 
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    } finally {
      setLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield size={16} className="text-red-500" />;
      case "musician":
        return <Music size={16} className="text-blue-500" />;
      case "organizer":
        return <Calendar size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id || user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.profilePicture ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePicture}`}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">
                          {user.username.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm text-gray-900 capitalize">
                  {getRoleIcon(user.role)}
                  {user.role}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/users/${user.id || user._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id || user._id)}
                    disabled={loading === (user.id || user._id)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

