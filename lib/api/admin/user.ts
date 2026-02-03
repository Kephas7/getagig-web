import { API } from "../endpoints";
import axios from "axios";

export const createUser = async (userData: any) => {
  try {
    const response = await axios.post(API.ADMIN.USER.CREATE, userData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
  } catch (error:any) {

    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(API.ADMIN.USER.GET);
    return response.data;
  } catch (error    :any) {
    throw new Error(error.response?.data?.message || "Failed to get users");
  }
};