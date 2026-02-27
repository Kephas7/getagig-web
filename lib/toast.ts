import { toast as rtToast, ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
};

export const toast = {
    success: (message: string, options?: ToastOptions) => {
        rtToast.success(message, { ...defaultOptions, ...options });
    },
    error: (message: string, options?: ToastOptions) => {
        rtToast.error(message, { ...defaultOptions, ...options });
    },
    info: (message: string, options?: ToastOptions) => {
        rtToast.info(message, { ...defaultOptions, ...options });
    },
    warning: (message: string, options?: ToastOptions) => {
        rtToast.warning(message, { ...defaultOptions, ...options });
    },
};
