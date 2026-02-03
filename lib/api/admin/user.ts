import { API } from "../endpoints";
import axiosInstance from "../axios";

const getHeaders = (token?: string) => {
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
};

export const createUser = async (userData: any, token?: string) => {
  try {
    const response = await axiosInstance.post(API.ADMIN.USER.CREATE, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getHeaders(token),
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

export const getUsers = async (token?: string) => {
  try {
    const response = await axiosInstance.get(API.ADMIN.USER.GET, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get users");
  }
};

export const getUserById = async (id: string, token?: string) => {
  try {
    const response = await axiosInstance.get(API.ADMIN.USER.GET_BY_ID(id), {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get user");
  }
};

export const updateUser = async (id: string, userData: any, token?: string) => {
  try {
    const response = await axiosInstance.put(API.ADMIN.USER.UPDATE(id), userData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getHeaders(token),
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
};

export const deleteUser = async (id: string, token?: string) => {
  try {
    const response = await axiosInstance.delete(API.ADMIN.USER.DELETE(id), {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};