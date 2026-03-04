import axiosInstance from "./axios";
import { API } from "./endpoints";

export const getMusicianProfile = async (token: string) => {
  const response = await axiosInstance.get(API.MUSICIAN.GET_OWN, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMusicianProfileById = async (id: string) => {
  const response = await axiosInstance.get(API.MUSICIAN.GET_BY_ID(id));
  return response.data;
};

export const createMusicianProfile = async (token: string, data: any) => {
  const response = await axiosInstance.post(API.MUSICIAN.CREATE, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateMusicianProfile = async (token: string, data: any) => {
  const response = await axiosInstance.put(API.MUSICIAN.UPDATE, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const requestMusicianVerification = async (token: string) => {
  const response = await axiosInstance.patch(
    API.MUSICIAN.REQUEST_VERIFICATION,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const getMusicianCalendarEvents = async (token: string) => {
  const response = await axiosInstance.get(API.MUSICIAN.CALENDAR_EVENTS, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createMusicianCalendarEvent = async (
  token: string,
  data: { title: string; date: string; note?: string },
) => {
  const response = await axiosInstance.post(
    API.MUSICIAN.CALENDAR_EVENTS,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const deleteMusicianCalendarEvent = async (
  token: string,
  eventId: string,
) => {
  const response = await axiosInstance.delete(
    API.MUSICIAN.DELETE_CALENDAR_EVENT(eventId),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const uploadMusicianMedia = async (
  token: string,
  endpoint: string,
  fieldName: string,
  files: File | File[],
) => {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => formData.append(fieldName, file));
  } else {
    formData.append(fieldName, files);
  }

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

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
    const errData = await res
      .json()
      .catch(() => ({ message: "Upload failed" }));
    throw { response: { data: errData } };
  }

  return res.json();
};

export const deleteMusicianMedia = async (
  token: string,
  endpoint: string,
  url: string,
) => {
  // Determine the field name based on endpoint for consistency (backend expects specific body fields)
  let body = {};
  if (endpoint.includes("photos")) body = { photoUrl: url };
  else if (endpoint.includes("videos")) body = { videoUrl: url };
  else if (endpoint.includes("audio")) body = { audioUrl: url };

  const response = await axiosInstance.delete(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  return response.data;
};
