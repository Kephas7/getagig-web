export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },
  ADMIN: {
    USER: {
      CREATE: "/api/admin/users",
      GET: "/api/admin/users",
      GET_BY_ID: (id: string) => `/api/admin/users/${id}`,
      UPDATE: (id: string) => `/api/admin/users/${id}`,
      DELETE: (id: string) => `/api/admin/users/${id}`,
    },

  }
};
