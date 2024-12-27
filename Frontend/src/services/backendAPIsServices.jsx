import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create an Axios instance with default settings
const api = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to include the token and x-orgid in all requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers["x-orgid"] = "1";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or unauthorized, clear token and redirect to login
        toast.error("Session expired, please log in again.", { theme: "dark" });
        localStorage.removeItem("token"); // Remove token from localStorage
        window.location.href = "/login"; // Redirect user to login page (adjust to your route)
      } else if (error.response.status === 403) {
        toast.error("You are not authorized to perform this action.", { theme: "dark" });
      }
    } else if (error.message.includes("Network Error")) {
      toast.error("Network error, please check your internet connection.", { theme: "dark" });
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out, please try again.", { theme: "dark" });
    } else {
      toast.error("An unexpected error occurred.", { theme: "dark" });
    }
    return Promise.reject(error);
  }
);

// API service functions

// GET request
export const getRequest = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("GET request error:", error);
    throw error;
  }
};

// NEW GET request with platform in headers
export const getRequestWithPlatform = async (url, platform, params = {}) => {
  try {
    const response = await api.get(url, {
      params,
      headers: { platform }, // Add platform to headers
    });
    return response.data;
  } catch (error) {
    console.error("GET request with platform error:", error);
    throw error;
  }
};

export const getRequestWithFilter = async (url, filter, params = {}) => {
  try {
    const response = await api.get(url, {
      params,
      headers: { filter }, // Add platform to headers
    });
    return response.data;
  } catch (error) {
    console.error("GET request with platform error:", error);
    throw error;
  }
};

// POST request
export const postRequest = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};

export const postRequestAds = async (url, data) => {
  try {
    const response = await api.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};

// PATCH request
export const patchRequest = async (url, data) => {
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error) {
    console.error("PATCH request error:", error);
    throw error;
  }
};

// PUT request
export const putRequest = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    console.error("PUT request error:", error);
    throw error;
  }
};

// DELETE request
export const deleteRequest = async (url, data) => {
  try {
    const response = await api.delete(url, {
      headers: {
        "Content-Type": "application/json",
      },
      data, // Send ad_ids as the payload
    });
    return response.data;
  } catch (error) {
    console.error("DELETE request error:", error);
    throw error;
  }
};

// Exporting Axios instance for custom use
export default api;
