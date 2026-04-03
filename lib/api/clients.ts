import axios from "axios";
import {
  getConsoleV2AxiosBaseUrl,
  getStudioAxiosBaseUrl,
} from "@/lib/mock-api-bases";

export const axiosStudio = axios.create({
  withCredentials: true,
});

axiosStudio.interceptors.request.use((config) => {
  config.baseURL = getStudioAxiosBaseUrl();
  return config;
});

export const axiosConsoleV2 = axios.create({
  withCredentials: true,
});

axiosConsoleV2.interceptors.request.use((config) => {
  config.baseURL = getConsoleV2AxiosBaseUrl();
  return config;
});
