import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const OrdersButton: React.FC = () => {
  return (
    <Link
      to="/orders"
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition py-1.5 px-2.5 rounded-lg hover:bg-slate-800"
      title="Danh sách đơn hàng mua sắm doanh nghiệp"
    >
      <FileText className="h-4 w-4 text-slate-400" />
      <span className="hidden sm:inline">Đơn mua sắm</span>
    </Link>
  );
};

export default OrdersButton;
