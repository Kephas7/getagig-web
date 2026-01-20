"use server";
import { login, register } from "@/lib/api/auth";
import { LoginData, RegisterData } from "@/app/(auth)/schema";
import { success } from "zod";

export const handleRegister = async (data: RegisterData) => {
  try {
    const response = await register(data);
    if (response.success) {
      return {
        success: true,
        message: "Registration successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Registration failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Registration action failed",
    };
  }
};

export const handleLogin = async (data: LoginData) => {
  try {
    const response = await login(data);
    if (response.success) {
      return {
        success: true,
        message: "Login successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Login failed",
    };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Login action failed" };
  }
};
