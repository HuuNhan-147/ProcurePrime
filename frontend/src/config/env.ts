// frontend/src/config/env.ts
// ============================================
// FRONTEND ENV CONFIG — Đọc & Thẩm định cấu hình client nghiêm ngặt
// ============================================

export interface FrontendConfig {
  apiUrl: string;
  socketUrl: string;
  isProduction: boolean;
  appName: string;
}

const rawApiUrl = import.meta.env.VITE_API_URL;
const rawSocketUrl = import.meta.env.VITE_SOCKET_URL;

export const env: FrontendConfig = {
  apiUrl: typeof rawApiUrl === "string" && rawApiUrl.trim().length > 0 
    ? rawApiUrl.trim() 
    : "http://localhost:5000/api",
  socketUrl: typeof rawSocketUrl === "string" && rawSocketUrl.trim().length > 0 
    ? rawSocketUrl.trim() 
    : "http://localhost:5000",
  isProduction: import.meta.env.PROD === true,
  appName: "ProcurePrime",
};

export default env;
