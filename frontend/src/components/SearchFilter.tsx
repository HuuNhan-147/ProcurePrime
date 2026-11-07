import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, RefreshCcw, Search, Building2, Wallet, ArrowUpDown } from "lucide-react";
import { fetchCategory } from "../api/CategoryApi";
import { ICategory } from "../types/category";
import { useAuth } from "../context/AuthContext";

interface SearchFilterProps {
  initialValues: {
    keyword?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sortBy?: string;
  };
}

// Các khung ngân sách dự án doanh nghiệp chuẩn
const BUDGET_PRESETS = [
  { label: "Tất cả hạn mức ngân sách", min: "", max: "" },
  { label: "Dưới 20 triệu ₫ (Thiết bị cơ bản / Màn hình)", min: "", max: "20000000" },
  { label: "20 - 50 triệu ₫ (Laptop / PC văn phòng chuẩn)", min: "20000000", max: "50000000" },
  { label: "50 - 100 triệu ₫ (Máy trạm Workstation / Server)", min: "50000000", max: "100000000" },
  { label: "Trên 100 triệu ₫ (Hạ tầng Enterprise / SAN)", min: "100000000", max: "" },
];

// Danh mục thương hiệu phần cứng doanh nghiệp uy tín
const ENTERPRISE_BRANDS = [
  "Dell",
  "Lenovo ThinkPad",
  "HP Enterprise",
  "Cisco",
  "Synology",
  "Logitech B2B",
];

const SearchFilter: React.FC<SearchFilterProps> = ({ initialValues }) => {
  const [filters, setFilters] = useState({
    keyword: initialValues.keyword || "",
    category: initialValues.category || "",
    minPrice: initialValues.minPrice || "",
    maxPrice: initialValues.maxPrice || "",
    sortBy: initialValues.sortBy || "latest",
  });

  const [categories, setCategories] = useState<ICategory[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategory();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục B2B:", error);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBudgetSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedIdx = Number(e.target.value);
    if (!isNaN(selectedIdx) && BUDGET_PRESETS[selectedIdx]) {
      const preset = BUDGET_PRESETS[selectedIdx];
      setFilters((prev) => ({
        ...prev,
        minPrice: preset.min,
        maxPrice: preset.max,
      }));
    }
  };

  const handleQuickBrandClick = (brandName: string) => {
    const newKeyword = filters.keyword === brandName ? "" : brandName;
    setFilters((prev) => ({ ...prev, keyword: newKeyword }));

    const queryParams = new URLSearchParams();
    if (newKeyword) queryParams.append("keyword", newKeyword);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

    const targetRoute = isAdmin ? "/admin/products/search" : "/products/search";
    navigate(`${targetRoute}?${queryParams.toString()}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    if (filters.keyword.trim()) queryParams.append("keyword", filters.keyword.trim());
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

    const targetRoute = isAdmin ? "/admin/products/search" : "/products/search";
    navigate(`${targetRoute}?${queryParams.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      keyword: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "latest",
    });
    navigate(isAdmin ? "/admin/products/search" : "/products/search");
  };

  // Xác định preset đang chọn theo minPrice/maxPrice
  const currentBudgetIdx = BUDGET_PRESETS.findIndex(
    (p) => p.min === filters.minPrice && p.max === filters.maxPrice
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-8">
      {/* Header bộ lọc B2B */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Bộ Lọc Thu Mua Thiết Bị B2B
            </h2>
            <p className="text-xs text-slate-500">
              Tra cứu theo tiêu chuẩn cấu hình phần cứng, khung ngân sách dự án và thương hiệu
            </p>
          </div>
        </div>

        {/* Quick Brand Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Hãng tiêu biểu:</span>
          {ENTERPRISE_BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => handleQuickBrandClick(brand)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition ${
                filters.keyword.toLowerCase().includes(brand.toLowerCase().split(" ")[0])
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Tìm kiếm theo tên / SKU / Thông số */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Từ khóa / Part Number / Specs</span>
            </label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Ví dụ: Latitude 5540, Core i7, 32GB, vPro..."
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* 2. Danh mục thiết bị B2B */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Nhóm giải pháp phòng ban</span>
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
            >
              <option value="">Tất cả danh mục thiết bị</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>Đang đồng bộ danh mục...</option>
              )}
            </select>
          </div>

          {/* 3. Phân khúc ngân sách dự án (Thay thế hoàn toàn bộ lọc Sao B2C) */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <span>Hạn mức ngân sách dự kiến</span>
            </label>
            <select
              value={currentBudgetIdx !== -1 ? currentBudgetIdx : ""}
              onChange={handleBudgetSelect}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
            >
              {BUDGET_PRESETS.map((preset, idx) => (
                <option key={idx} value={idx}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sắp xếp báo giá */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Thứ tự hiển thị</span>
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleChange}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
            >
              <option value="latest">Mới cập nhật trong catalog</option>
              <option value="priceLowHigh">Đơn giá: Tối ưu ngân sách (Thấp → Cao)</option>
              <option value="priceHighLow">Đơn giá: Cấu hình cao cấp (Cao → Thấp)</option>
              <option value="bestSelling">Trang bị nhiều nhất theo dự án</option>
            </select>
          </div>
        </div>

        {/* Nút hành động bộ lọc */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Xóa bộ lọc</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
          >
            <span>Áp Dụng Lọc Thiết Bị</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;