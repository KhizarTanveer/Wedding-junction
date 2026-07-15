import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showError = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showLoading = (message = "Loading...") => {
  return toast.loading(message, {
    position: "top-right",
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const updateToast = (toastId, { type, message }) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
    closeOnClick: true,
  });
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  update: updateToast,
};
