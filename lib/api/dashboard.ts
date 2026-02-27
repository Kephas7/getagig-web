import axiosInstance from "./axios";

export const getMusicianDashboard = async (token: string) => {
    const response = await axiosInstance.get("/api/dashboard/musician", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getOrganizerDashboard = async (token: string) => {
    const response = await axiosInstance.get("/api/dashboard/organizer", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
