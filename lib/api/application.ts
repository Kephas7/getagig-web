import axiosInstance from "./axios";
import { API } from "./endpoints";

export const applyToGig = async (token: string, data: { gigId: string; coverLetter?: string }) => {
    const response = await axiosInstance.post("/api/applications", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getMusicianApplications = async (token: string) => {
    const response = await axiosInstance.get("/api/applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getGigApplications = async (token: string, gigId: string) => {
    const response = await axiosInstance.get(`/api/applications/gig/${gigId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateApplicationStatus = async (token: string, applicationId: string, status: "accepted" | "rejected") => {
    const response = await axiosInstance.put(`/api/applications/${applicationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
