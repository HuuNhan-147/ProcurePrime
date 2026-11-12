import "./ui/enterprise.css";
import React, { Component, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
const PublicNotifications = lazy(() => import("./ui/PublicNotifications"));
class NotificationBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { pathname } = location;

  // Ẩn Header nếu đường dẫn bắt đầu với "/admin" hoặc là các trang cụ thể
  const hideHeader =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/reset-password/") ||
    [
      "/register",
      "/login",
      "/forgot-password",
      "/reset-password",
      "/change-password",
    ].includes(pathname);

  return (
    <>
      {!hideHeader && <Header />}
      {children}
      <NotificationBoundary><Suspense fallback={null}><PublicNotifications /></Suspense></NotificationBoundary>
    </>
  );
};

export default Layout;
