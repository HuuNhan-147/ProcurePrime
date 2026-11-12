import { tx, uiText, useLocale, locale, formatVND, formatDate } from "../i18n";
import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ExternalLink,
  Flame,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getDashboardStats,
  getMonthlyRevenue,
  getTopSellingProducts,
  getLatestOrders,
  getLatestUsers,
  getOrderStatusStats,
} from "../api/DashboardApi";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

const Dashboard: React.FC = () => {
  useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [latestUsers, setLatestUsers] = useState<any[]>([]);
  const [orderStatusStats, setOrderStatusStats] = useState<any>(null);
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, revenue, topProds, orders, users, orderStats] =
          await Promise.all([
            getDashboardStats(),
            getMonthlyRevenue(),
            getTopSellingProducts(),
            getLatestOrders(),
            getLatestUsers(),
            getOrderStatusStats(),
          ]);

        setStats(statsData);
        setMonthlyRevenue(revenue || []);
        setTopProducts(topProds || []);
        setLatestOrders(orders || []);
        setLatestUsers(users || []);
        setOrderStatusStats(orderStats);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Định dạng nhãn trục Y thông minh (K, M, B) tránh bị hiển thị 0M khi doanh thu nhỏ
  const formatYAxisLabel = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) {
      const m = val / 1000000;
      return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    }
    if (val >= 1000) {
      const k = Math.round(val / 1000);
      return `${k}K`;
    }
    return `${Math.round(val)}`;
  };

  // Chuẩn hóa mảng điểm doanh thu: nếu có ít hơn 4 tháng, bổ sung các tháng trước đó để biểu đồ có đường cong xu hướng
  const revenuePoints = (() => {
    if (monthlyRevenue && monthlyRevenue.length > 0) {
      if (monthlyRevenue.length === 1) {
        const currentMonthStr = monthlyRevenue[0]._id || "2026-04";
        const parts = currentMonthStr.split("-").map(Number);
        const year = parts[0] || 2026;
        const month = parts[1] || 4;
        const points = [];
        for (let i = 3; i >= 1; i--) {
          let prevMonth = month - i;
          let prevYear = year;
          if (prevMonth <= 0) {
            prevMonth += 12;
            prevYear -= 1;
          }
          const mStr = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
          points.push({ _id: `${prevYear}-${mStr}`, totalRevenue: 0 });
        }
        points.push(monthlyRevenue[0]);
        return points;
      }
      return monthlyRevenue;
    }
    return [
      { _id: "2026-01", totalRevenue: 12500000 },
      { _id: "2026-02", totalRevenue: 18900000 },
      { _id: "2026-03", totalRevenue: 24200000 },
      { _id: "2026-04", totalRevenue: stats?.totalRevenue || 35000000 },
    ];
  })();

  const maxRevenue = Math.max(...revenuePoints.map((p) => p.totalRevenue), 1000);
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const pointsCoordinates = revenuePoints.map((item, idx) => {
    const x =
      paddingX +
      (idx / Math.max(revenuePoints.length - 1, 1)) *
        (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      (item.totalRevenue / maxRevenue) * (svgHeight - paddingY * 2);
    return { x, y, ...item };
  });

  const pathD = pointsCoordinates.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaD =
    pointsCoordinates.length > 0
      ? `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${
          svgHeight - paddingY
        } L ${pointsCoordinates[0].x} ${svgHeight - paddingY} Z`
      : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header chào mừng */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{tx("adminDashboard:overview")}</h1>
          <p className="text-slate-500 text-sm mt-1">{tx("adminDashboard:salesOrdersAndCatalogInformationFromSystem")}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
            <Calendar size={14} className="text-[#254AD7]" />
            <span>
              {uiText(new Date().toLocaleDateString(locale(), {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              }))}
            </span>
          </div>
          <Link
            to="/admin/products"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#254AD7] hover:bg-[#254AD7] text-white text-xs font-bold rounded-lg transition-colors"
          >{tx("adminDashboard:manageInventory")}</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          label={tx("adminDashboard:totalRevenue")}
          value={stats ? formatVND(stats.totalRevenue || 0) : "—"}
          trend="—"
          isPositive={true}
          description={tx("adminDashboard:noComparativeData")}
          icon={<DollarSign size={22} className="text-[#254AD7]" />}
          gradient="from-indigo-500/10 to-purple-500/10"
          iconBg="bg-indigo-100"
        />
        <KPICard
          label={tx("adminDashboard:ordersPlaced")}
          value={stats ? stats.totalOrders || 0 : "—"}
          trend="—"
          isPositive={true}
          description={tx("adminDashboard:noComparativeData")}
          icon={<ShoppingBag size={22} className="text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
          iconBg="bg-emerald-100"
        />
        <KPICard
          label={tx("adminDashboard:registeredCustomers")}
          value={stats ? stats.totalUsers || 0 : "—"}
          trend="—"
          isPositive={true}
          description={tx("adminDashboard:noComparativeData")}
          icon={<Users size={22} className="text-[#254AD7]" />}
          gradient="from-blue-500/10 to-cyan-500/10"
          iconBg="bg-blue-100"
        />
        <KPICard
          label={tx("adminDashboard:productsInStock")}
          value={stats ? stats.totalProducts || 0 : "—"}
          trend="—"
          isPositive={true}
          description={tx("adminDashboard:noComparativeData")}
          icon={<Package size={22} className="text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
          iconBg="bg-amber-100"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Doanh thu (Area Chart SVG) */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#edf1ff] rounded-lg text-[#254AD7]">
                  <TrendingUp size={18} />
                </span>
                <h3 className="font-bold text-slate-800 text-base">{tx("adminDashboard:monthlyRevenue")}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{tx("adminDashboard:revenueTrendsBasedOnPaidOrders")}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">{tx("adminDashboard:automaticVisualisation")}</span>
          </div>

          {/* SVG Canvas Area Chart */}
          {monthlyRevenue.length > 1 ? (<div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 select-none"
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y =
                  svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fontSize="9"
                      fill="#94a3b8"
                      textAnchor="end"
                    >
                      {uiText(formatYAxisLabel(maxRevenue * pct))}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Area */}
              {areaD && <path d={areaD} fill="url(#revenueGradient)" />}

              {/* Path Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Points */}
              {pointsCoordinates.map((pt, idx) => (
                <g
                  key={idx}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setActiveChartPoint(idx)}
                  onMouseLeave={() => setActiveChartPoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activeChartPoint === idx ? "7" : "5"}
                    fill="#ffffff"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    className="transition-all"
                  />
                  {/* Label Month */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    fontSize="10"
                    fill="#64748b"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {pt._id ? formatDate(new Date(Number(pt._id.slice(0, 4)), Number(pt._id.slice(5, 7)) - 1, 1), {month:'short'}) : '—'}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Card */}
            {activeChartPoint !== null && pointsCoordinates[activeChartPoint] && (
              <div
                className="absolute bg-slate-900 text-white px-3 py-2 rounded-lg text-xs pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(pointsCoordinates[activeChartPoint].x / svgWidth) * 100}%`,
                  top: `${(pointsCoordinates[activeChartPoint].y / svgHeight) * 100}%`,
                  marginTop: "-12px",
                }}
              >
                <p className="font-semibold text-slate-300">{tx("adminDashboard:month")}{" "}{uiText(pointsCoordinates[activeChartPoint]._id)}
                </p>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">
                  {formatVND(pointsCoordinates[activeChartPoint].totalRevenue)}
                </p>
              </div>
            )}
          </div>) : <p className="pp-empty">{tx("adminDashboard:theChartRequiresAtLeastTwoMonths")}</p>}
<div className="pp-table-region" role="region" aria-label={tx("adminDashboard:monthlyRevenue2")} tabIndex={0}><table><caption>{tx("adminDashboard:revenueDataReturnedByTheServer")}</caption><thead><tr><th scope="col">{tx("adminDashboard:month2")}</th><th scope="col">{tx("adminDashboard:revenueVnd")}</th></tr></thead><tbody>{monthlyRevenue.map((entry, index) => <tr key={index}><td>{uiText(entry._id)}</td><td>{uiText(Number(entry.totalRevenue).toLocaleString(locale()))}</td></tr>)}</tbody></table></div>
        </div>

        {/* Trạng thái đơn hàng (Donut Chart & Distribution) */}
        {stats && orderStatusStats ? (<div className="bg-white rounded-lg border border-slate-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />{tx("adminDashboard:orderStatus")}</h3>
              <span className="text-xs text-slate-400">{tx("adminDashboard:processingRate")}</span>
            </div>

            {/* Donut Chart Visual */}
            <div className="py-4 flex items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      251.2 -
                      (251.2 *
                        ((orderStatusStats?.delivered || 0) +
                          (orderStatusStats?.paid || 0))) /
                        Math.max(stats?.totalOrders || 1, 1)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-semibold text-slate-900">
                    {uiText(stats?.totalOrders || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{tx("adminDashboard:totalOrders")}</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Legend */}
            <div className="space-y-2.5 mt-2 divide-y divide-slate-100">
              <StatusRow
                label={tx("adminDashboard:paymentCompleted")}
                count={orderStatusStats?.paid || 0}
                colorBg="bg-emerald-500"
              />
              <StatusRow
                label={tx("adminDashboard:deliveredToCustomer")}
                count={orderStatusStats?.delivered || 0}
                colorBg="bg-indigo-500"
              />
              <StatusRow
                label={tx("adminDashboard:awaitingProcessingDelivery")}
                count={
                  Math.max(
                    (stats?.totalOrders || 0) -
                      (orderStatusStats?.delivered || 0),
                    0
                  )
                }
                colorBg="bg-amber-500"
              />
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#254AD7] hover:text-[#254AD7] flex items-center justify-between group"
          >
            <span>{tx("adminDashboard:manageOrders")}</span>
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>) : <section className="pp-empty"><h3>{tx("adminDashboard:orderStatus2")}</h3><p>{tx("adminDashboard:insufficientServerData")}</p></section>}
      </div>

      {/* Top Products & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Sản Phẩm Bán Chạy (2 Cột) */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Flame size={19} className="text-orange-500 fill-orange-500" />{tx("adminDashboard:bestSellingProducts")}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{tx("adminDashboard:leadingProductsBySalesAndOrderVolume")}</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#254AD7] hover:text-[#254AD7] hover:underline"
            >{tx("adminDashboard:viewAll")}</Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">{tx("adminDashboard:noBestSellingProductData")}</p>
            ) : (
              topProducts.slice(0, 5).map((product, index) => {
                const maxSold = Math.max(...topProducts.map((p) => p.totalSold || 1));
                const percentage = Math.round(((product.totalSold || 0) / maxSold) * 100);

                return (
                  <div
                    key={product.productId || index}
                    className="py-3.5 flex items-center gap-4 group hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                  >
                    {/* Rank Badge */}
                    <div
                      className={` w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : index === 1
                          ? "bg-slate-200 text-slate-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "text-slate-400"
                      }  `}
                    >
                      {uiText(index + 1)}
                    </div>

                    {/* Image */}
                    <img
                      src={product.image || "/images/no-image.png"}
                      alt={uiText(product.name)}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://via.placeholder.com/60?text=SP";
                      }}
                    />

                    {/* Info & Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-slate-800 truncate group-hover:text-[#254AD7] transition-colors">
                          {uiText(product.name)}
                        </p>
                        <span className="font-bold text-xs text-slate-900 shrink-0">
                          {uiText(product.totalSold)}{" "}{tx("adminDashboard:sold")}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-[#254AD7] h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Khách Hàng Mới Nhất (1 Cột) */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Users size={18} className="text-[#254AD7]" />{tx("adminDashboard:newCustomers")}</h3>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-[#254AD7] hover:text-[#254AD7]"
              >{tx("adminDashboard:details")}</Link>
            </div>

            <div className="divide-y divide-slate-100">
              {latestUsers.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-[#254AD7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {uiText(user.name?.[0]?.toUpperCase() || "U")}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#254AD7] transition-colors">
                        {uiText(user.name)}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {uiText(user.email)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={` text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      user.isAdmin
                        ? "bg-[#edf1ff] text-[#254AD7] border border-purple-200"
                        : "bg-slate-100 text-slate-600"
                    }  `}
                  >
                    {uiText(user.isAdmin ? tx("adminDashboard:admin") : tx("adminDashboard:guest"))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">{tx("adminDashboard:syncedDirectlyFromMongodbAtlas")}</span>
          </div>
        </div>
      </div>

      {/* Đơn hàng mới nhất (Full width table) */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock size={18} className="text-[#254AD7]" />{tx("adminDashboard:recentOrders")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{tx("adminDashboard:theFiveMostRecentTransactions")}</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[#254AD7] hover:text-[#254AD7] hover:underline flex items-center gap-1"
          >{tx("adminDashboard:manageAllOrders")}{" "}<ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <div className="pp-table-region" role="region" aria-label={tx("adminDashboard:dataTable")} tabIndex={0}><table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:orderReference")}</th>
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:customer")}</th>
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:orderDate")}</th>
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:total")}</th>
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:payment")}</th>
                <th scope="col" className="py-3 px-4">{tx("adminDashboard:delivery")}</th>
                <th scope="col" className="py-3 px-4 text-right">{tx("adminDashboard:actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">{tx("adminDashboard:noOrdersYet")}</td>
                </tr>
              ) : (
                latestOrders.map((order) => {
                  const isPaid = (order as any).payment?.isPaid;
                  const total =
                    (order as any).payment?.totalPrice ||
                    order.totalPrice ||
                    0;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#254AD7]">
                        {uiText(order.orderCode || order._id.slice(-6).toUpperCase())}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {uiText(order.user?.name || tx("adminDashboard:guest2"))}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {uiText(new Date(order.createdAt).toLocaleDateString(locale(), {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        }))}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatVND(total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={` inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }  `}
                        >
                          <span
                            className={` w-1.5 h-1.5 rounded-full ${
                              isPaid ? "bg-emerald-500" : "bg-amber-500"
                            }  `}
                          />
                          {uiText(isPaid ? tx("adminDashboard:paid") : tx("adminDashboard:awaitingPayment"))}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={` inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            order.isDelivered
                              ? "bg-[#edf1ff] text-[#254AD7] border border-indigo-200"
                              : "bg-slate-100 text-slate-600"
                          }  `}
                        >
                          {uiText(order.isDelivered ? tx("adminDashboard:delivered") : tx("adminDashboard:processing"))}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#254AD7] hover:bg-[#edf1ff] transition-colors inline-block"
                          title={tx("adminDashboard:viewOrderDetails")}
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
};

/* Component thẻ KPI */
interface KPICardProps {
  label: string;
  value: number | string;
  trend: string;
  isPositive: boolean;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

const KPICard = ({
  label,
  value,
  trend,
  isPositive,
  description,
  icon,
  gradient,
  iconBg,
}: KPICardProps) => (
  <div className="bg-white rounded-lg border border-slate-200/80 p-5 relative overflow-hidden transition-all duration-200">

    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {uiText(label)}
        </p>
        <p className="text-2xl font-semibold text-slate-900 mt-2 tracking-tight">
          {uiText(value)}
        </p>
      </div>
      <div className={` p-2.5 rounded-lg ${iconBg}  `}>{uiText(icon)}</div>
    </div>
    <div className="flex items-center gap-1.5 mt-3 text-xs">
      <span
        className={` font-bold flex items-center ${
          isPositive ? "text-emerald-600" : "text-rose-600"
        }  `}
      >
        {trend !== "—" && (isPositive ? (
          <ArrowUpRight size={14} className="stroke-[2.5]" />
        ) : (
          <ArrowDownRight size={14} className="stroke-[2.5]" />
        ))}
        {uiText(trend)}
      </span>
      <span className="text-slate-400">{uiText(description)}</span>
    </div>
  </div>
);

/* Component dòng thống kê Donut */
const StatusRow = ({
  label,
  count,
  colorBg,
}: {
  label: string;
  count: number;
  colorBg: string;
}) => (
  <div className="flex items-center justify-between pt-2.5 first:pt-0">
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className={` w-2.5 h-2.5 rounded-full ${colorBg}  `} />
      <span>{uiText(label)}</span>
    </div>
    <span className="text-xs font-bold text-slate-900">{uiText(count)}{" "}{tx("adminDashboard:orders")}</span>
  </div>
);

export default Dashboard;
