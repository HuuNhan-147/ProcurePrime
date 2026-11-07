import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileCheck, Headphones, Building2, Award } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* 1. THANH CAM KẾT CHUẨN DOANH NGHIỆP (B2B TRUST BAR) */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">100% Chính Hãng B2B</h4>
                <p className="text-[11px] text-slate-400">Dell, HP, Lenovo ProSupport</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Hóa Đơn VAT & Hợp Đồng</h4>
                <p className="text-[11px] text-slate-400">Theo Thông tư 78/2021/TT-BTC</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Xác Thực Chữ Ký SHA-256</h4>
                <p className="text-[11px] text-slate-400">Báo giá kiểm toán bất biến</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">SLA Kỹ Thuật 24/7</h4>
                <p className="text-[11px] text-slate-400">Hotline B2B: 1900 2154</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH CHÂN TRANG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Cột 1: Thông tin pháp nhân */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">
                Procure<span className="text-indigo-400">Prime</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                B2B Enterprise Portal
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Hệ thống Mua sắm & Tự động Lập Báo giá Thiết bị Doanh nghiệp. Tối ưu hóa danh mục thiết bị theo ngân sách phòng ban, tự động đối soát chính sách và xuất bản Báo Giá B2B có giá trị pháp lý trong vài giây.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
              <p><strong>Pháp nhân:</strong> CÔNG TY CỔ PHẦN CÔNG NGHỆ PROCUREPRIME VIỆT NAM</p>
              <p><strong>Mã số doanh nghiệp:</strong> 0317892345 • Cấp bởi Sở KH&ĐT TP.HCM</p>
              <p><strong>Trụ sở:</strong> Tòa nhà Innovation Hub, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
            </div>
          </div>

          {/* Cột 2: Danh mục giải pháp thu mua */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Giải Pháp Phần Cứng Phòng Ban
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/products?category=workstation" className="hover:text-indigo-300 transition">
                  Máy trạm Workstation & Laptop Doanh nghiệp (vPro / ECC)
                </Link>
              </li>
              <li>
                <Link to="/products?category=display" className="hover:text-indigo-300 transition">
                  Màn hình đồ họa chuẩn màu & Trạm kết nối Type-C 90W
                </Link>
              </li>
              <li>
                <Link to="/products?category=meeting" className="hover:text-indigo-300 transition">
                  Giải pháp phòng họp trực tuyến AI Camera 4K (Logitech)
                </Link>
              </li>
              <li>
                <Link to="/products?category=network" className="hover:text-indigo-300 transition">
                  Hạ tầng lưu trữ NAS RAID & Thiết bị mạng bảo mật Cisco
                </Link>
              </li>
              <li>
                <Link to="/products?category=printer" className="hover:text-indigo-300 transition">
                  Hệ thống in ấn & số hóa chứng từ tốc độ cao
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Quản trị & Tuân thủ */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Quy Chế & Vận Hành
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/workspace" className="text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1">
                  <span>Procurement Workspace (AI)</span>
                  <span className="text-[9px] bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-500/30">Active</span>
                </Link>
              </li>
              <li>
                <a href="#compliance" className="hover:text-slate-300 transition">
                  Chính sách đối soát hạn mức ngân sách
                </a>
              </li>
              <li>
                <a href="#audit" className="hover:text-slate-300 transition">
                  Cơ chế kiểm toán SHA-256 Audit Fingerprint
                </a>
              </li>
              <li>
                <a href="#sla" className="hover:text-slate-300 transition">
                  Cam kết SLA giao hàng & lắp đặt tận nơi
                </a>
              </li>
              <li>
                <a href="#warranty" className="hover:text-slate-300 transition">
                  Chính sách bảo hành On-site ProSupport
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. DÒNG BẢN QUYỀN VÀ THÔNG TIN HACKATHON */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>
            © 2026 ProcurePrime B2B Enterprise Portal. Phát triển bởi Đội ngũ <strong>AgentX Prime</strong>.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>AI for Business Innovation 2026</span>
            <span>•</span>
            <span>Deterministic Governance Engine</span>
            <span>•</span>
            <span>WebMCP Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
