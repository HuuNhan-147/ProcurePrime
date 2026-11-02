import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategory } from "../api/CategoryApi";
import { ICategory } from "../types/category";

// Cấu hình danh mục B2B tiêu biểu cho Interactive Matrix
const B2B_SOLUTIONS = [
  {
    name: "Máy Tính & Máy Trạm Doanh Nghiệp",
    shortTitle: "Máy Tính & Máy Trạm",
    badge: "Core Hardware",
    highlightDevice: "Dell Precision 3660 & ThinkPad T14",
    specs: "i7/i9 vPro • 32GB/64GB RAM • 1TB NVMe",
    warranty: "Bảo hành 36T On-site ProSupport",
    priceRange: "Từ 19.800.000 ₫",
  },
  {
    name: "Màn Hình & Hiển Thị Văn Phòng",
    shortTitle: "Màn Hình Chuẩn Màu",
    badge: "Visual Workspace",
    highlightDevice: "Dell UltraSharp U2724D & U3223QE",
    specs: "2K/4K IPS Black • 120Hz • Type-C 90W Hub",
    warranty: "Đổi mới tận nơi 36T",
    priceRange: "Từ 9.850.000 ₫",
  },
  {
    name: "Thiết Bị Hội Nghị & Ngoại Vi",
    shortTitle: "Phòng Họp & Ngoại Vi",
    badge: "Collaboration",
    highlightDevice: "Logitech MeetUp 4K & MX Keys S",
    specs: "Camera 4K 120° FOV • Micro AI • FIPS Bolt",
    warranty: "Chính hãng 24T",
    priceRange: "Từ 4.850.000 ₫",
  },
  {
    name: "Máy In & Thiết Bị Số Hóa",
    shortTitle: "Máy In & Số Hóa ADF",
    badge: "Document Flow",
    highlightDevice: "HP LaserJet Pro 4103fdw & Canon DR-C225",
    specs: "In 40 trang/phút • Quét 2 mặt Duplex tự động",
    warranty: "Bảo hành 36T tận nơi",
    priceRange: "Từ 8.950.000 ₫",
  },
  {
    name: "Hạ Tầng Mạng & Lưu Trữ Doanh Nghiệp",
    shortTitle: "Hạ Tầng NAS & Mạng",
    badge: "Infrastructure",
    highlightDevice: "Synology DS923+ & Cisco CBS250 PoE+",
    specs: "4 Khay HDD RAID • 24 Cổng Gigabit PoE+ 195W",
    warranty: "Limited Lifetime Cisco",
    priceRange: "Từ 15.400.000 ₫",
  },
];

const Banner: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategory();
        setCategories(data);
      } catch (err) {
        console.warn("Không thể tải danh mục:", err);
      }
    };
    loadCategories();
  }, []);

  const currentSolution = B2B_SOLUTIONS[activeSolutionIndex];

  const handleFilterByCategory = () => {
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === currentSolution.name.toLowerCase()
    );
    if (matchedCategory) {
      navigate(`/products/search?category=${matchedCategory._id}&sortBy=latest`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="relative w-full bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Background Radial Glow & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.2),rgba(15,23,42,0))] pointer-events-none"></div>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* CỘT TRÁI (60% ~ 7 cols): HERO STATEMENT & CALL-TO-ACTION */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hackathon Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>K-TECH HACKATHON 2026 • AUTONOMOUS B2B PROCUREMENT</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Trang Bị Thiết Bị Doanh Nghiệp{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                Tự Hành Với AI Agent
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Giải phóng phòng thu mua khỏi bảng tính và báo giá thủ công. Tự động bóc tách combo thiết bị theo phòng ban, đối soát trần ngân sách và xuất bản Báo Giá Doanh Nghiệp chuẩn mực kèm chữ ký số SHA-256 chỉ trong 30 giây.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/workspace")}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
              >
                <span>Mở Procurement Workstation (AI)</span>
                <span className="text-xs bg-indigo-950/80 px-2 py-0.5 rounded font-mono uppercase">
                  B2B
                </span>
              </button>

              <button
                onClick={() => navigate("/products")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-700 transition"
              >
                Khám Phá Danh Mục Thiết Bị
              </button>
            </div>

            {/* Trust & Policy Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-white">5%</p>
                <p className="text-xs text-slate-400 mt-0.5">Chiết khấu sỉ dự án</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-white">36 Tháng</p>
                <p className="text-xs text-slate-400 mt-0.5">Bảo hành On-site tận nơi</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Hóa đơn GTGT & Hợp đồng</p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (40% ~ 5 cols): INTERACTIVE HARDWARE MATRIX CARD */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Danh Mục Cung Ứng B2B
                  </h3>
                  <p className="text-[11px] text-slate-500">Khám phá giải pháp theo nhu cầu phòng ban</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 px-2 py-0.5 rounded">
                  5 Nhóm Thiết Bị
                </span>
              </div>

              {/* Solution Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {B2B_SOLUTIONS.map((sol, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSolutionIndex(idx)}
                    className={`text-left p-2 rounded-lg text-xs font-semibold transition ${
                      activeSolutionIndex === idx
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="block truncate">{sol.shortTitle}</span>
                  </button>
                ))}
              </div>

              {/* Active Solution Preview Box */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                    {currentSolution.badge}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">
                    {currentSolution.priceRange}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {currentSolution.highlightDevice}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {currentSolution.specs}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Dịch vụ: {currentSolution.warranty}</span>
                </div>

                <button
                  onClick={handleFilterByCategory}
                  className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold py-2 px-3 rounded-lg transition text-center"
                >
                  Xem Toàn Bộ {currentSolution.shortTitle} →
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                * Hỗ trợ cấu hình tùy biến linh hoạt theo ngân sách phòng ban
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
