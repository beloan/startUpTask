import { QueryClient } from "@tanstack/react-query";
import axios, { InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    phoneField?: string;
  }
}

let getAuthPhone: () => string | null = () => null;

export const configureAuth = (getter: () => string | null) => {
  getAuthPhone = getter;
};

export const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://app.tablecrm.com/api/v1/mp";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url?.startsWith("http://")) {
    config.url = config.url.replace("http://", "https://");
  }
  if (config.baseURL?.startsWith("http://")) {
    config.baseURL = config.baseURL.replace("http://", "https://");
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const errorMessage = error.message || "Unknown error";
    if (
      !errorMessage.includes("certificate") &&
      !errorMessage.includes("SSL") &&
      !errorMessage.includes("TLS")
    ) {
      if (errorData && Object.keys(errorData).length > 0) {
        console.error("API Error:", errorData);
      } else if (errorMessage) {
        console.error("API Error:", errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),

      staleTime: 10 * 60 * 1000,

      gcTime: 30 * 60 * 1000,

      refetchOnWindowFocus: false,

      refetchOnMount: false,

      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});