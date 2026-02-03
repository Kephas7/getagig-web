"use sever";
import { createUser, getUsers } from "@/lib/api/admin/user";
import { revalidatePath } from "next/cache";
export const createUserAction = async (userData: any) => {
  try {
    const response = await createUser(userData);
    if (response.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        message: "User created successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to create user",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to create user",
    };
  }
};
export const getUsersAction = async () => {
  try {
    const response = await getUsers();
    if (response.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        message: "Users fetched successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch users",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch users",
    };
  }
};  