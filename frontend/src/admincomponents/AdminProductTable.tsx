import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IProduct } from "../types/product";
import { deleteProduct } from "../api/productApi";
import {
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  Star,
  ExternalLink,
  Plus,
} from "lucide-react";
import AdminPagination from "./AdminPagination";

interface AdminProductTableProps {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  token: string | null;
  onDeleteProduct: (productId: string) => void;
}

const AdminProductTable: React.FC<AdminProductTableProps> = ({
  products,
  loading,
  error,
  token,
  onDeleteProduct,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const totalPages = Math.max(Math.ceil(products.length / itemsPerPage), 1);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [products.length, totalPages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Package
            size={22}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600"
          />
        </div>
        <span className="mt-4 text-slate-600 text-sm font-semibold">
          Đang đồng bộ danh sách sản phẩm...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex p-3 bg-rose-50 rounded-2xl text-rose-600 mb-3">
          <AlertTriangle size={28} />
        </div>
        <h4 className="font-bold text-slate-800 text-base">Không thể tải sản phẩm</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex p-4 bg-slate-100 rounded-3xl text-slate-400 mb-3">
          <Package size={36} />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Không tìm thấy sản phẩm nào
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Không có sản phẩm nào phù hợp với từ khóa hoặc bộ lọc tìm kiếm hiện tại.
        </p>
        <button
          onClick={() => navigate("/admin/add-product")}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus size={15} /> Thêm sản phẩm mới ngay
        </button>
      </div>
    );
  }

  const handleDelete = (productId: string, productName: string) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa sản phẩm "${productName}" khỏi hệ thống?`
      )
    ) {
      deleteProduct(productId, token)
        .then(() => {
          onDeleteProduct(productId);
          alert("Đã xóa sản phẩm thành công!");
        })
        .catch(() => alert("Xóa sản phẩm thất bại. Vui lòng thử lại sau."));
    }
  };

  return (
    <div>
      {/* Table Toolbar Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">
            Danh Sách Sản Phẩm
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            {products.length} sản phẩm
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Hiển thị theo: <span className="font-semibold text-slate-700">Mới cập nhật</span>
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-6">Sản Phẩm</th>
              <th className="py-3.5 px-4">Đơn Giá</th>
              <th className="py-3.5 px-4">Tồn Kho</th>
              <th className="py-3.5 px-4">Đánh Giá</th>
              <th className="py-3.5 px-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((product) => {
                const stock = product.countInStock ?? 0;
                let stockBadge;
                if (stock <= 0) {
                  stockBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Hết hàng
                    </span>
                  );
                } else if (stock <= 5) {
                  stockBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Còn ít ({stock})
                    </span>
                  );
                } else {
                  stockBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Còn {stock} món
                    </span>
                  );
                }

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Cột 1: Ảnh + Tên */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <img
                            src={product.image || "/images/no-image.png"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://via.placeholder.com/80?text=SP";
                            }}
                          />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            ID: {product._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Giá */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₫{product.price?.toLocaleString("vi-VN")}
                    </td>

                    {/* Cột 3: Tồn Kho */}
                    <td className="py-3.5 px-4">{stockBadge}</td>

                    {/* Cột 4: Đánh Giá */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 text-xs">
                          {product.rating || 5.0}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({product.numReviews || 0})
                        </span>
                      </div>
                    </td>

                    {/* Cột 5: Hành Động */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/product/${product._id}`)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <AdminPagination
        currentPage={currentPage}
        totalItems={products.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemsPerPageOptions={[8, 12, 24, 48]}
      />
    </div>
  );
};

export default AdminProductTable;
