import { tx, useLocale } from "../i18n";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchFilter from "../components/SearchFilter";

interface AdminProductSearchFilterProps {
  initialValues: {
    keyword: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    rating: string;
    sortBy: string;
  };
}

const AdminProductSearchFilter: React.FC<AdminProductSearchFilterProps> = ({
  initialValues,
}) => {
  useLocale();
  const navigate = useNavigate();

  // Khi người dùng muốn reset bộ lọc
  const handleResetFilters = () => {
    navigate("/products", { replace: true });
  };

  return (
    <div className="mb-8 bg-white rounded-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{tx("adminProducts:searchFilters")}</h2>
      <SearchFilter initialValues={initialValues} />
      <button type="button"
        onClick={handleResetFilters}
        className="mt-4 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
      >{tx("adminProducts:clearFilters")}</button>
    </div>
  );
};

export default AdminProductSearchFilter;
