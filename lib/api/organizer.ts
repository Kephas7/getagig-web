import axiosInstance from "./axios";
import { API } from "./endpoints";

export const getOrganizerProfile = async (token: string) => {
    const response = await axiosInstance.get(API.ORGANIZER.GET_OWN, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getOrganizerProfileById = async (id: string) => {
    const response = await axiosInstance.get(API.ORGANIZER.GET_BY_ID(id));
    return response.data;
};

export const createOrganizerProfile = async (token: string, data: any) => {
    const response = await axiosInstance.post(API.ORGANIZER.CREATE, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateOrganizerProfile = async (token: string, data: any) => {
    const response = await axiosInstance.put(API.ORGANIZER.UPDATE, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const uploadOrganizerMedia = async (token: string, endpoint: string, fieldName: string, files: File | File[]) => {
    const formData = new FormData();

    if (Array.isArray(files)) {
        files.forEach((file) => formData.append(fieldName, file));
    } else {
        formData.append(fieldName, files);
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

    // Use native fetch instead of axios so the browser automatically sets
    // the correct `Content-Type: multipart/form-data; boundary=...` header.
    // The axios instance has a default `Content-Type: application/json` that
    // cannot be reliably removed per-request and would break multipart parsing.
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // No Content-Type here — browser sets it with boundary automatically
        },
        body: formData,
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Upload failed" }));
        throw { response: { data: errData } };
    }

    return res.json();
};

export const deleteOrganizerMedia = async (token: string, endpoint: string, url: string) => {
    let body = {};
    if (endpoint.includes("photos")) body = { photoUrl: url };
    else if (endpoint.includes("videos")) body = { videoUrl: url };
    else if (endpoint.includes("documents")) body = { documentUrl: url };

    const response = await axiosInstance.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        data: body
    });
    return response.data;
};
