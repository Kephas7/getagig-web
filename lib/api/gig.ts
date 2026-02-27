import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface GigLocation {
    city: string;
    state: string;
    country: string;
}

export interface Gig {
    id: string;
    title: string;
    description: string;
    organizerId: any;
    location: GigLocation;
    genres: string[];
    instruments: string[];
    payRate: number;
    eventType: string;
    status: "open" | "closed" | "filled";
    deadline: string;
    createdAt: string;
    updatedAt: string;
}

export const getGigs = async (params?: any) => {
    const response = await axiosInstance.get(API.GIG.GET_ALL, { params });
    return response.data;
};

export const getGigById = async (id: string) => {
    const response = await axiosInstance.get(API.GIG.GET_BY_ID(id));
    return response.data;
};

export const createGig = async (token: string, data: Partial<Gig>) => {
    const response = await axiosInstance.post(API.GIG.CREATE, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateGig = async (token: string, id: string, data: Partial<Gig>) => {
    const response = await axiosInstance.put(API.GIG.UPDATE(id), data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const deleteGig = async (token: string, id: string) => {
    const response = await axiosInstance.delete(API.GIG.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
