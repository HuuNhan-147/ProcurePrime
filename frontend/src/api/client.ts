// frontend/src/api/client.ts
// ============================================
// CENTRALIZED HTTP CLIENT — Axios instance chuẩn hóa
// ============================================

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor: Tự động đính kèm Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor: Chuẩn hóa xử lý lỗi phản hồi & 401 Session Expired
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("🔒 [HTTP Client] Phiên làm việc đã hết hạn hoặc chưa đăng nhập (401)");
        // Không tự ý xóa token nếu đang ở trang công khai, chỉ dọn dẹp khi cần
      }

      if (status === 403) {
        console.warn("🚫 [HTTP Client] Không đủ thẩm quyền truy cập tài nguyên (403)");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

