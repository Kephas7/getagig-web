import axiosInstance from "./axios";

const defaultMusicianDashboard = {
  stats: [],
  recentGigs: [],
};

const defaultOrganizerDashboard = {
  stats: [],
  recentGigs: [],
};

export const getMusicianDashboard = async (token: string) => {
  try {
    const response = await axiosInstance.get("/api/dashboard/musician", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        success: true,
        data: defaultMusicianDashboard,
      };
    }
    throw error;
  }
};

export const getOrganizerDashboard = async (token: string) => {
  try {
    const response = await axiosInstance.get("/api/dashboard/organizer", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        success: true,
        data: defaultOrganizerDashboard,
      };
    }
    throw error;
  }
};
