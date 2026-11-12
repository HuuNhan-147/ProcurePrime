import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RouteSurface, { lazyPage } from "../components/ui/RouteSurface";
import HomePage from "../pages/HomePage";
const ProductList = lazyPage(() => import("../components/FeaturedProducts"), ["catalog", "cart"]);
const LoginPage = lazyPage(() => import("../pages/LoginPage"), ["auth"]);
const AdminPage = lazyPage(() => import("../pages/AdminPage"), ["adminDashboard"]);
import { AuthProvider } from "../context/AuthContext";
import Layout from "../components/Layout";
const CartPage = lazyPage(() => import("../pages/CartPage"), ["cart", "quotation"]);
const ListOrderPage = lazyPage(() => import("../pages/ListOrderPage"), ["orders"]);
const PaymentResult = lazyPage(() => import("../pages/PaymentPage"), ["payment"]);
const OrderPage = lazyPage(() => import("../pages/OrderPage"), ["checkout"]);
const ProductDetail = lazyPage(() => import("../components/ProductDetail"), ["catalog", "cart"]);
const Register = lazyPage(() => import("../pages/RegisterPage"), ["auth"]);
const ForgotPassword = lazyPage(() => import("../pages/ForgotPassword"), ["auth"]);
const ResetPassword = lazyPage(() => import("../pages/ResetPassword"), ["auth"]);
const AdminLayout = lazyPage(() => import("../admincomponents/AdminLayout"), ["admin"]);
const AdminProductList = lazyPage(() => import("../admincomponents/AdminProductList"), ["admin", "adminProducts", "catalog"]);
const AddProduct = lazyPage(() => import("../admincomponents/AddProduct"), ["adminProducts"]);
const GetDetail = lazyPage(() => import("../admincomponents/GetDetail"), ["adminProducts"]);
const ChangePassword = lazyPage(() => import("../pages/ChangePassword"), ["auth"]);
import { CartProvider } from "../context/CartContext";
const CategoryManagement = lazyPage(() => import("../admincomponents/CategoryManagement"), ["admin", "adminCategories"]);
const AdminUserManagement = lazyPage(() => import("../admincomponents/AdminUserManagement"), ["admin", "adminUsers"]);
const AdminOrderManager = lazyPage(() => import("../admincomponents/AdminOrderManager"), ["admin", "adminOrders"]);
const OrderDetails = lazyPage(() => import("../admincomponents/OrderDetails"), ["adminOrders", "orders"]);
const SearchProduct = lazyPage(() => import("../admincomponents/SearchProduct"), ["adminProducts", "catalog"]);
import AIAgentChat from "../components/AIAgentChat";
const ProcurementWorkspace = lazyPage(() => import("../pages/ProcurementWorkspace"), ["workspace", "quotation"]);
const PolicyManagement = lazyPage(() => import("../admincomponents/PolicyManagement"), ["policies"]);

const AppRoutes = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Tuyến đường chuyên biệt toàn màn hình cho AI Procurement Workstation */}
            <Route path="/workspace" element={<RouteSurface><ProcurementWorkspace /></RouteSurface>} />

            {/* Routes cho trang người dùng */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<RouteSurface><HomePage /></RouteSurface>} />
                    <Route path="/workspace" element={<RouteSurface><ProcurementWorkspace /></RouteSurface>} />
                    <Route path="/products/search" element={<RouteSurface><ProductList /></RouteSurface>} />
                    <Route path="/products" element={<RouteSurface><ProductList /></RouteSurface>} />
                    <Route path="/login" element={<RouteSurface><LoginPage /></RouteSurface>} />
                    <Route path="/cart" element={<RouteSurface><CartPage /></RouteSurface>} />
                    <Route path="/orders" element={<RouteSurface><ListOrderPage /></RouteSurface>} />
                    <Route path="/payment-result" element={<RouteSurface><PaymentResult /></RouteSurface>} />
                    <Route path="/create" element={<RouteSurface><OrderPage /></RouteSurface>} />
                    <Route path="/products/:id" element={<RouteSurface><ProductDetail /></RouteSurface>} />
                    <Route path="/register" element={<RouteSurface><Register /></RouteSurface>} />
                    <Route
                      path="/forgot-password"
                      element={<RouteSurface><ForgotPassword /></RouteSurface>}
                    />
                    <Route
                      path="/reset-password/:resetToken"
                      element={<RouteSurface><ResetPassword /></RouteSurface>}
                    />
                    <Route
                      path="/change-password"
                      element={<RouteSurface><ChangePassword /></RouteSurface>}
                    />
                  </Routes>
                  <AIAgentChat />
                </Layout>
              }
            />

            {/* Routes cho trang admin */}
            <Route
              path="/admin/*"
              element={
                <RouteSurface><AdminLayout>
                  <Routes>
                    <Route path="/" element={<RouteSurface><AdminPage /></RouteSurface>} />
                    <Route path="/products" element={<RouteSurface><AdminProductList /></RouteSurface>} />
                    <Route path="/add-product" element={<RouteSurface><AddProduct /></RouteSurface>} />
                    <Route path="/product/:id" element={<RouteSurface><GetDetail /></RouteSurface>} />
                    <Route
                      path="/categories"
                      element={<RouteSurface><CategoryManagement /></RouteSurface>}
                    />
                    <Route path="/users" element={<RouteSurface><AdminUserManagement /></RouteSurface>} />
                    <Route path="/orders" element={<RouteSurface><AdminOrderManager /></RouteSurface>} />
                    <Route path="/orders/:id" element={<RouteSurface><OrderDetails /></RouteSurface>} />
                    <Route path="/workspace" element={<RouteSurface><ProcurementWorkspace /></RouteSurface>} />
                    <Route path="/policies" element={<RouteSurface><PolicyManagement /></RouteSurface>} />
                    <Route
                      path="/products/search"
                      element={<RouteSurface><SearchProduct /></RouteSurface>}
                    />
                  </Routes>           
                </AdminLayout></RouteSurface>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
