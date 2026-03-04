"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  CreateUserSchema,
  UpdateUserSchema,
  CreateUserFormValues,
  UpdateUserFormValues,
} from "../schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { createUser, updateUser } from "@/lib/api/admin/user";
import { Camera } from "lucide-react";

interface UserFormProps {
  initialData?: User;
  token?: string;
}

export function UserForm({ initialData, token }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.profilePicture
      ? initialData.profilePicture.startsWith("http")
        ? initialData.profilePicture
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${initialData.profilePicture}`
      : null,
  );

  const schema = initialData ? UpdateUserSchema : CreateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      role: initialData?.role || "musician",
      password: "",
    },
  });

  const onSubmit = async (
    data: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    setLoading(true);
    setMutationError(null);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("role", data.role);

    if (data.password) {
      formData.append("password", data.password);
    }

    if (data.profilePicture && data.profilePicture[0] instanceof File) {
      formData.append("profilePicture", data.profilePicture[0]);
    }

    const editingUser = !!initialData;

    try {
      if (initialData) {
        const userId = initialData.id || initialData._id;
        await updateUser(userId, formData, token);
      } else {
        await createUser(formData, token);
      }
      // Refresh first to revalidate cache, then navigate
      router.refresh();
      router.push("/admin/users");
      toast.success(
        editingUser ? "User updated successfully" : "User created successfully",
      );
    } catch (error: any) {
      console.error("Mutation failed:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to save user",
      );
      setMutationError(
        error.response?.data?.message || error.message || "Failed to save user",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border/70 p-6 sm:p-8 rounded-2xl">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        {initialData ? "Edit User" : "Create User"}
      </h2>

      {mutationError && (
        <div className="bg-error/10 text-error p-4 rounded-xl mb-6 border border-error/20">
          {mutationError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-foreground/10 overflow-hidden mb-2 relative group border border-border/60">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/45">
                <Camera size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={24} />
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...register("profilePicture")}
              onChange={(e) => {
                register("profilePicture").onChange(e);
                handleImageChange(e);
              }}
            />
          </div>
          <p className="text-sm text-foreground/60">Click to upload photo</p>
          {errors.profilePicture && (
            <p className="text-error text-sm">
              {errors.profilePicture.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground/75 mb-1">
              Username
            </label>
            <input
              {...register("username")}
              className="w-full border border-border/70 bg-background rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="Username"
            />
            {errors.username && (
              <p className="text-error text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground/75 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full border border-border/70 bg-background rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground/75 mb-1">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full border border-border/70 bg-background rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="musician">Musician</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-error text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground/75 mb-1">
              {initialData
                ? "New Password (leave blank to keep current)"
                : "Password"}
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full border border-border/70 bg-background rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-error text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-foreground/80 bg-foreground/8 rounded-xl hover:bg-foreground/12 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : initialData
                ? "Update User"
                : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
