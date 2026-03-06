"use client";

import { User } from "../schema";
import { useState } from "react";
import {
  deleteUser,
  verifyMusician,
  verifyOrganizer,
} from "@/lib/api/admin/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Shield,
  Music,
  Calendar,
  BadgeCheck,
  ShieldX,
  Eye,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { resolveMediaUrl } from "@/lib/utils";

type VerificationAction = "approve" | "deny" | "unverify";

interface UsersTableProps {
  initialUsers: User[];
  token?: string;
  initialFilter?: "all" | "musician" | "organizer" | "pending";
}

export function UsersTable({
  initialUsers,
  token,
  initialFilter = "all",
}: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(
    Array.isArray(initialUsers) ? initialUsers : [],
  );
  const [roleFilter, setRoleFilter] = useState<
    "all" | "musician" | "organizer" | "pending"
  >(initialFilter);
  const [loading, setLoading] = useState<string | null>(null);
  const [denyTargetUser, setDenyTargetUser] = useState<User | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const router = useRouter();

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "pending") {
      return (
        (user.role === "musician" || user.role === "organizer") &&
        !user.isVerified &&
        Boolean(user.verificationRequested)
      );
    }
    return user.role === roleFilter;
  });

  const musicianCount = users.filter((user) => user.role === "musician").length;
  const organizerCount = users.filter(
    (user) => user.role === "organizer",
  ).length;
  const pendingCount = users.filter(
    (user) =>
      (user.role === "musician" || user.role === "organizer") &&
      !user.isVerified &&
      Boolean(user.verificationRequested),
  ).length;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(id);
    try {
      await deleteUser(id, token);
      setUsers(users.filter((user) => (user.id || user._id) !== id));
      toast.success("User deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield size={16} className="text-error" />;
      case "musician":
        return <Music size={16} className="text-primary" />;
      case "organizer":
        return <Calendar size={16} className="text-success" />;
      default:
        return null;
    }
  };

  const getUserAvatar = (user: User) => {
    const row = user as any;
    return (
      user.profilePicture ||
      row?.musicianProfile?.profilePicture ||
      row?.organizerProfile?.profilePicture ||
      row?.profile?.profilePicture ||
      ""
    );
  };

  const handleVerifyAction = async (
    user: User,
    action: VerificationAction,
    customReason?: string,
  ) => {
    const userId = user.id || user._id;
    const shouldVerify = action === "approve";

    if (
      action === "approve" &&
      !user.isVerified &&
      !user.verificationRequested
    ) {
      toast.error("User has not requested verification yet");
      return;
    }

    let rejectionReason: string | undefined;

    if (action === "deny") {
      if (!user.verificationRequested || user.isVerified) {
        toast.error("No pending verification request to deny");
        return;
      }

      const trimmedReason = (customReason || "").trim();
      if (!trimmedReason) {
        toast.error("Rejection reason is required");
        return;
      }

      rejectionReason = trimmedReason;
    }

    setLoading(`verify-${userId}`);
    try {
      if (user.role === "musician") {
        await verifyMusician(userId, shouldVerify, token, rejectionReason);
      } else if (user.role === "organizer") {
        await verifyOrganizer(userId, shouldVerify, token, rejectionReason);
      } else {
        return;
      }

      setUsers((prev) =>
        prev.map((row) =>
          (row.id || row._id) === userId
            ? {
                ...row,
                isVerified: shouldVerify,
                verificationRequested: false,
              }
            : row,
        ),
      );

      toast.success(
        action === "approve"
          ? `${user.role === "musician" ? "Musician" : "Organizer"} verified successfully`
          : action === "deny"
            ? `${user.role === "musician" ? "Musician" : "Organizer"} verification request denied`
            : `${user.role === "musician" ? "Musician" : "Organizer"} set as unverified successfully`,
      );

      router.refresh();
    } catch (error) {
      console.error("Failed to update verification", error);
      toast.error("Failed to update verification status");
    } finally {
      setLoading(null);
    }
  };

  const openDenyModal = (user: User) => {
    if (!user.verificationRequested || user.isVerified) {
      toast.error("No pending verification request to deny");
      return;
    }

    setDenyTargetUser(user);
    setDenyReason("");
  };

  const closeDenyModal = () => {
    if (
      denyTargetUser &&
      loading === `verify-${denyTargetUser.id || denyTargetUser._id}`
    ) {
      return;
    }

    setDenyTargetUser(null);
    setDenyReason("");
  };

  const submitDeny = async () => {
    if (!denyTargetUser) return;

    const trimmedReason = denyReason.trim();
    if (!trimmedReason) {
      toast.error("Rejection reason is required");
      return;
    }

    await handleVerifyAction(denyTargetUser, "deny", trimmedReason);
    setDenyTargetUser(null);
    setDenyReason("");
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl overflow-hidden border border-border/70">
      <div className="px-6 pt-5 pb-3 border-b border-border/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-foreground/65">
          <span className="font-medium text-foreground">
            {filteredUsers.length}
          </span>{" "}
          users shown
        </div>

        <div className="inline-flex rounded-full border border-border/70 p-1 bg-background/70">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              roleFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("musician")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              roleFilter === "musician"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Musicians ({musicianCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("organizer")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              roleFilter === "organizer"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Organizers ({organizerCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("pending")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              roleFilter === "pending"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-border/70">
        <thead className="bg-foreground/[0.04]">
          <tr>
            <th className="px-6 py-3 text-left text-[11px] font-semibold text-foreground/55 uppercase tracking-wide">
              User
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-semibold text-foreground/55 uppercase tracking-wide">
              Role
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-semibold text-foreground/55 uppercase tracking-wide">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-semibold text-foreground/55 uppercase tracking-wide">
              Verification
            </th>
            <th className="px-6 py-3 text-right text-[11px] font-semibold text-foreground/55 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {filteredUsers.map((user) => {
            const avatar = getUserAvatar(user);

            return (
              <tr
                key={user.id || user._id}
                className="hover:bg-foreground/[0.02] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={resolveMediaUrl(avatar)}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center border border-border/50">
                          <span className="text-foreground/65 text-sm font-medium">
                            {user.username.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-foreground">
                        {user.username}
                      </div>
                      <div className="text-sm text-foreground/60">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-foreground capitalize">
                    {getRoleIcon(user.role)}
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === "musician" || user.role === "organizer" ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isVerified
                          ? "bg-success/10 text-success border border-success/20"
                          : user.verificationRequested
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-warning/10 text-warning border border-warning/20"
                      }`}
                    >
                      {user.isVerified
                        ? "Verified"
                        : user.verificationRequested
                          ? "Requested"
                          : "Not Verified"}
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/50">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    {(user.role === "musician" || user.role === "organizer") &&
                      user.profileId && (
                        <Link
                          href={
                            user.role === "musician"
                              ? `/musician/profile/${user.profileId}`
                              : `/organizer/profile/${user.profileId}`
                          }
                          className="text-foreground/60 hover:text-foreground transition-colors"
                          title="View profile"
                        >
                          <Eye size={18} />
                        </Link>
                      )}

                    {(user.role === "musician" ||
                      user.role === "organizer") && (
                      <button
                        onClick={() =>
                          handleVerifyAction(
                            user,
                            user.isVerified ? "unverify" : "approve",
                          )
                        }
                        disabled={loading === `verify-${user.id || user._id}`}
                        className={`transition-opacity disabled:opacity-50 ${
                          user.isVerified
                            ? "text-warning hover:opacity-80"
                            : "text-success hover:opacity-80"
                        }`}
                        title={
                          user.isVerified
                            ? "Mark as unverified"
                            : user.verificationRequested
                              ? "Approve verification request"
                              : "User has not requested verification"
                        }
                      >
                        {user.isVerified ? (
                          <ShieldX size={18} />
                        ) : (
                          <BadgeCheck size={18} />
                        )}
                      </button>
                    )}

                    {(user.role === "musician" || user.role === "organizer") &&
                      user.verificationRequested &&
                      !user.isVerified && (
                        <button
                          onClick={() => openDenyModal(user)}
                          disabled={loading === `verify-${user.id || user._id}`}
                          className="text-error hover:opacity-80 transition-opacity disabled:opacity-50"
                          title="Deny verification request"
                        >
                          <ShieldX size={18} />
                        </button>
                      )}

                    <Link
                      href={`/admin/users/${user.id || user._id}/edit`}
                      className="text-primary hover:opacity-80 transition-opacity"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id || user._id)}
                      disabled={loading === (user.id || user._id)}
                      className="text-error hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredUsers.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-4 text-center text-foreground/55"
              >
                No users found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {denyTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">
              Deny Verification Request
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Send a custom reason to {denyTargetUser.username} explaining why
              verification was denied.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground/65">
                Rejection Reason
              </label>
              <textarea
                value={denyReason}
                onChange={(event) => setDenyReason(event.target.value)}
                rows={4}
                placeholder="e.g. Please add clearer profile details and at least one portfolio sample."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDenyModal}
                disabled={
                  loading ===
                  `verify-${denyTargetUser.id || denyTargetUser._id}`
                }
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeny}
                disabled={
                  loading ===
                  `verify-${denyTargetUser.id || denyTargetUser._id}`
                }
                className="rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Send Denial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
