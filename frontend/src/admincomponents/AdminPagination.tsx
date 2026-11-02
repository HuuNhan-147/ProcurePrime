import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  itemsPerPageOptions?: number[];
}

const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [8, 10, 20, 50],
}) => {
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);

  // Không hiển thị nếu không có mục nào
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo danh sách trang cần hiển thị (bao gồm dấu ...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn có trang 1
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Các trang xung quanh trang hiện tại
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Luôn có trang cuối
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-slate-50/70 border-t border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
      {/* Thông tin số lượng & Chọn số dòng/trang */}
      <div className="flex flex-wrap items-center gap-3 text-slate-500">
        <div>
          Hiển thị{" "}
          <span className="font-bold text-slate-800">{startIndex}</span> -{" "}
          <span className="font-bold text-slate-800">{endIndex}</span> trên tổng số{" "}
          <span className="font-bold text-slate-800">{totalItems}</span> mục
        </div>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Điều hướng trang */}
      <div className="flex items-center gap-1">
        {/* Nút về trang đầu */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Về trang đầu"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Nút Trang Trước */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Các số trang */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-semibold"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Nút Trang Sau */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <ChevronRight size={15} />
        </button>

        {/* Nút đến trang cuối */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Đến trang cuối"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
