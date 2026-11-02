// backend/scripts/seedB2BCatalog.js
// =========================================================================
// SEEDER DỮ LIỆU B2B PROCUREMENT CHO DOANH NGHIỆP — PROCUREPRIME
// =========================================================================
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Category from "../models/CategoryModel.js";
import Product from "../models/ProductModel.js";
import Specification from "../models/SpecificationModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Lỗi: MONGO_URI không tồn tại trong backend/.env");
  process.exit(1);
}

// 1. Danh mục chuẩn Doanh nghiệp (Enterprise Categories)
const b2bCategories = [
  {
    name: "Máy Tính & Máy Trạm Doanh Nghiệp",
    description: "Hệ thống máy tính để bàn đồng bộ, máy trạm xử lý đồ họa chuyên sâu và máy tính xách tay chuẩn doanh nghiệp đạt độ bền quân đội.",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Màn Hình & Hiển Thị Văn Phòng",
    description: "Màn hình văn phòng chuyên dụng, màn hình đồ họa màu sắc chuẩn, tỷ lệ tối ưu cho làm việc đa nhiệm và bảo vệ mắt.",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Thiết Bị Hội Nghị & Ngoại Vi",
    description: "Giải pháp phòng họp trực tuyến Teams/Zoom, webcam 4K góc rộng, micro đa hướng và bộ bàn phím chuột bảo mật cao.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Máy In & Thiết Bị Số Hóa",
    description: "Máy in laser mạng tốc độ cao, máy quét tài liệu 2 mặt ADF tự động và thiết bị in ấn đa chức năng cho doanh nghiệp.",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Hạ Tầng Mạng & Lưu Trữ Doanh Nghiệp",
    description: "Thiết bị định tuyến chuyên dụng, switch quản lý PoE+, hệ thống lưu trữ mạng NAS đa khay sao lưu dữ liệu tập trung an toàn.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60",
  },
];

// 2. Danh sách Sản phẩm Doanh nghiệp kèm Specifications
const b2bProducts = [
  // --- NHÓM 1: MÁY TÍNH & MÁY TRẠM ---
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "Dell Latitude 5540 B2B Enterprise Laptop (i5-1345U / 16GB / 512GB)",
    price: 24500000,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    description: "Laptop doanh nghiệp Dell Latitude 5540 trang bị vi xử lý Intel Core i5 thế hệ 13 vPro, RAM 16GB DDR5, ổ cứng 512GB SSD NVMe siêu tốc. Vỏ hợp kim bền bỉ đạt chuẩn quân đội MIL-STD 810H, tích hợp chip bảo mật TPM 2.0 và gói bảo hành tận nơi 36 tháng Dell ProSupport.",
    countInStock: 85,
    rating: 4.8,
    numReviews: 12,
    specs: [
      { key: "CPU", value: "Intel Core i5-1345U vPro (10 Cores, 12 Threads)", group: "Hiệu năng" },
      { key: "RAM", value: "16GB DDR5 5200MHz (Nâng cấp tối đa 64GB)", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "512GB PCIe Gen4 M.2 NVMe SSD", unit: "GB", group: "Lưu trữ" },
      { key: "Bảo hành", value: "36 Tháng Dell ProSupport On-site tận nơi", group: "Dịch vụ B2B" },
      { key: "Hệ điều hành", value: "Windows 11 Pro Bản quyền Doanh nghiệp", group: "Phần mềm" },
      { key: "Chính sách B2B", value: "Chiết khấu 5% cho đơn hàng dự án từ 10 máy", group: "Chính sách B2B" },
    ],
  },
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "Lenovo ThinkPad T14 Gen 4 Business Laptop (i7-1365U / 32GB / 1TB)",
    price: 31200000,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
    description: "Dòng máy tính xách tay tiêu chuẩn vàng cho doanh nhân và kỹ sư IT Lenovo ThinkPad T14 Gen 4. Cấu hình cao cấp Intel Core i7-1365U vPro, 32GB RAM DDR5 đa nhiệm mượt mà, ổ cứng 1TB SSD dung lượng lớn. Bàn phím chống tràn công thái học, bảo mật vân tay và ThinkShield.",
    countInStock: 45,
    rating: 4.9,
    numReviews: 18,
    specs: [
      { key: "CPU", value: "Intel Core i7-1365U vPro (10 Cores, up to 5.2GHz)", group: "Hiệu năng" },
      { key: "RAM", value: "32GB LPDDR5x 6400MHz", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "1TB PCIe Gen4 Performance NVMe SSD", unit: "TB", group: "Lưu trữ" },
      { key: "Bảo hành", value: "36 Tháng Lenovo Premier Support 24/7", group: "Dịch vụ B2B" },
      { key: "Màn hình", value: "14 inch WUXGA IPS 400 nits Low Power 100% sRGB", group: "Hiển thị" },
      { key: "Chính sách B2B", value: "Hỗ trợ cấu hình tùy biến theo yêu cầu phòng ban", group: "Chính sách B2B" },
    ],
  },
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "Dell OptiPlex 7010 Tower Máy Tính Đồng Bộ Doanh Nghiệp (i7-13700 / 32GB / 512GB)",
    price: 21800000,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80",
    description: "Máy tính để bàn doanh nghiệp Dell OptiPlex 7010 Tower hoạt động bền bỉ liên tục 24/7. Trang bị Intel Core i7-13700 mạnh mẽ (16 cores), 32GB RAM DDR5, 512GB SSD NVMe kết hợp nguồn chuẩn 80 PLUS Platinum tiết kiệm điện năng cho khối văn phòng.",
    countInStock: 120,
    rating: 4.7,
    numReviews: 24,
    specs: [
      { key: "CPU", value: "Intel Core i7-13700 (16 Cores, 24 Threads, 30MB Cache)", group: "Hiệu năng" },
      { key: "RAM", value: "32GB DDR5 4800MHz Dual Channel", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "512GB M.2 PCIe NVMe Class 35 SSD", unit: "GB", group: "Lưu trữ" },
      { key: "Nguồn", value: "Dell 260W Internal PSU 80 Plus Platinum", group: "Phần cứng" },
      { key: "Bảo hành", value: "36 Tháng On-site Service tại địa chỉ doanh nghiệp", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "Dell Precision 3660 Tower Máy Trạm Đồ Họa & Kỹ Thuật (i9-13900K / 64GB / 2TB / RTX A4000)",
    price: 56900000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    description: "Máy trạm Workstation chuyên dụng cho phòng R&D, thiết kế CAD/BIM và xử lý dữ liệu AI. Vi xử lý Intel Core i9-13900K, RAM 64GB DDR5 ECC tự sửa lỗi, card đồ họa chuyên nghiệp NVIDIA RTX A4000 16GB GDDR6, hệ thống tản nhiệt chất lỏng siêu êm ái.",
    countInStock: 25,
    rating: 5.0,
    numReviews: 8,
    specs: [
      { key: "CPU", value: "Intel Core i9-13900K (24 Cores, 32 Threads, up to 5.8GHz)", group: "Hiệu năng" },
      { key: "RAM", value: "64GB DDR5 4400MHz ECC UDIMM", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "2TB PCIe Gen4 NVMe M.2 SSD", unit: "TB", group: "Lưu trữ" },
      { key: "VGA", value: "NVIDIA RTX A4000 16GB GDDR6 Workstation Graphics", group: "Đồ họa" },
      { key: "Bảo hành", value: "36 Tháng Dell ProSupport Plus Mission Critical", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "Apple MacBook Pro 14 M3 Pro Doanh Nghiệp (18GB Unified / 512GB SSD)",
    price: 49990000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    description: "MacBook Pro 14 inch trang bị chip Apple M3 Pro thế hệ mới dành cho đội ngũ phát triển phần mềm, UI/UX Designer và quản lý cấp cao. Thời lượng pin kỷ lục lên đến 18 giờ, màn hình Liquid Retina XDR độ sáng 1600 nits đỉnh cao.",
    countInStock: 35,
    rating: 4.9,
    numReviews: 15,
    specs: [
      { key: "CPU", value: "Apple M3 Pro chip (11-core CPU, 14-core GPU, 16-core Neural Engine)", group: "Hiệu năng" },
      { key: "RAM", value: "18GB Unified Memory tốc độ băng thông 150GB/s", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "512GB Apple High-Speed SSD", unit: "GB", group: "Lưu trữ" },
      { key: "Màn hình", value: "14.2 inch Liquid Retina XDR (3024x1964) ProMotion 120Hz", group: "Hiển thị" },
      { key: "Bảo hành", value: "24 Tháng Apple Care+ for Enterprise", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Máy Tính & Máy Trạm Doanh Nghiệp",
    name: "HP EliteBook 840 G10 Enterprise Laptop (i5-1340P / 16GB / 512GB)",
    price: 25900000,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
    description: "Laptop cao cấp dành cho khối nhân viên văn phòng và chuyên viên tài chính. Trang bị vi xử lý Intel Core i5-1340P 12 nhân, 16GB RAM DDR5, vỏ nhôm nguyên khối siêu nhẹ 1.36kg tích hợp công nghệ bảo mật độc quyền HP Wolf Security.",
    countInStock: 60,
    rating: 4.8,
    numReviews: 9,
    specs: [
      { key: "CPU", value: "Intel Core i5-1340P (12 Cores, 16 Threads, up to 4.6GHz)", group: "Hiệu năng" },
      { key: "RAM", value: "16GB DDR5 5200MHz", unit: "GB", group: "Bộ nhớ" },
      { key: "Storage", value: "512GB PCIe NVMe TLC SSD", unit: "GB", group: "Lưu trữ" },
      { key: "Bảo mật", value: "HP Sure Sense, HP Sure Click, Fingerprint Sensor", group: "Bảo mật" },
      { key: "Bảo hành", value: "36 Tháng On-site HP Vietnam", group: "Dịch vụ B2B" },
    ],
  },

  // --- NHÓM 2: MÀN HÌNH VĂN PHÒNG ---
  {
    categoryName: "Màn Hình & Hiển Thị Văn Phòng",
    name: "Màn Hình Chuyên Nghiệp Dell UltraSharp U2724D 27 inch 2K IPS Black 120Hz",
    price: 9850000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    description: "Màn hình văn phòng cao cấp chuẩn màu cho doanh nghiệp Dell UltraSharp U2724D. Tấm nền IPS Black độ tương phản 2000:1, tần số quét 120Hz mượt mà, cảm biến ánh sáng xung quanh tự động điều chỉnh độ sáng, giảm 35% ánh sáng xanh có hại.",
    countInStock: 90,
    rating: 4.9,
    numReviews: 31,
    specs: [
      { key: "Kích thước", value: "27 inch (Tỷ lệ 16:9)", group: "Hiển thị" },
      { key: "Độ phân giải", value: "2K QHD (2560 x 1440) @ 120Hz", group: "Hiển thị" },
      { key: "Tấm nền", value: "IPS Black, 100% sRGB, 98% DCI-P3, Delta E < 2", group: "Chất lượng màu" },
      { key: "Cổng kết nối", value: "DisplayPort 1.4, HDMI, USB-C Uplink, 4x USB-A 10Gbps", group: "Kết nối" },
      { key: "Bảo hành", value: "36 Tháng 1 đổi 1 tận nơi Dell Premium Panel Exchange", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Màn Hình & Hiển Thị Văn Phòng",
    name: "Màn Hình Đồ Họa Dell UltraSharp U3223QE 32 inch 4K USB-C Hub Monitor",
    price: 19500000,
    image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80",
    description: "Màn hình 4K HDR kiêm trạm Docking USB-C 90W cấp nguồn cho laptop. Tích hợp cổng mạng LAN RJ45, tính năng KVM Switch điều khiển 2 máy tính cùng lúc bằng 1 bộ chuột phím, tấm nền IPS Black 4K tái tạo màu sắc trung thực.",
    countInStock: 40,
    rating: 5.0,
    numReviews: 19,
    specs: [
      { key: "Kích thước", value: "31.5 inch (Tỷ lệ 16:9)", group: "Hiển thị" },
      { key: "Độ phân giải", value: "4K UHD (3840 x 2160) VESA DisplayHDR 400", group: "Hiển thị" },
      { key: "Docking Station", value: "USB-C 90W PD, RJ45 Gigabit Ethernet, KVM Switch", group: "Tính năng B2B" },
      { key: "Bảo hành", value: "36 Tháng Dell ProSupport On-site", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Màn Hình & Hiển Thị Văn Phòng",
    name: "Màn Hình Công Thái Học LG DualUp 28MQ780-B 28 inch Tỷ Lệ 16:18 Đa Nhiệm",
    price: 13900000,
    image: "https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?w=800&auto=format&fit=crop&q=80",
    description: "Giải pháp màn hình đôi tích hợp theo chiều dọc tỷ lệ 16:18 độc quyền từ LG, tương đương 2 màn hình 21.5 inch xếp chồng. Chân đế công thái học Ergo Arm kẹp bàn linh hoạt giúp tiết kiệm diện tích tối đa cho bàn làm việc.",
    countInStock: 30,
    rating: 4.8,
    numReviews: 14,
    specs: [
      { key: "Kích thước", value: "27.6 inch (Tỷ lệ độc quyền 16:18)", group: "Hiển thị" },
      { key: "Độ phân giải", value: "SDQHD (2560 x 2880) Nano IPS, DCI-P3 98%", group: "Hiển thị" },
      { key: "Chân đế", value: "LG Ergo Arm (Xoay, nghiêng, nâng hạ, xoay trục 360 độ)", group: "Thiết kế" },
      { key: "Bảo hành", value: "24 Tháng chính hãng LG Vietnam", group: "Dịch vụ B2B" },
    ],
  },

  // --- NHÓM 3: THIẾT BỊ HỘI NGHỊ & NGOẠI VI ---
  {
    categoryName: "Thiết Bị Hội Nghị & Ngoại Vi",
    name: "Hệ Thống Hội Nghị Trực Tuyến Logitech MeetUp 4K Ultra-HD Cho Phòng Họp",
    price: 22500000,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    description: "Thiết bị hội nghị All-in-one cao cấp dành cho phòng họp vừa và nhỏ (đến 8 người). Camera 4K góc quay cực rộng 120 độ FOV, công nghệ RightSight tự động căn khung hình người nói, hệ thống 3 micro định hướng lọc tạp âm và loa công suất lớn.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 22,
    specs: [
      { key: "Độ phân giải", value: "4K Ultra HD (3840 x 2160) @ 30fps", group: "Camera" },
      { key: "Góc quay", value: "120 độ FOV, zoom số 5x HD", group: "Camera" },
      { key: "Micro & Loa", value: "3 beamforming mics bán kính 4m, loa chống rung", group: "Âm thanh" },
      { key: "Chứng nhận", value: "Certified for Microsoft Teams, Zoom, Google Meet", group: "Chứng chỉ" },
      { key: "Bảo hành", value: "24 Tháng 1 đổi 1 Logitech Business", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Thiết Bị Hội Nghị & Ngoại Vi",
    name: "Bộ Chuột & Bàn Phím Không Dây Logitech MX Keys S Combo Doanh Nghiệp",
    price: 4850000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    description: "Combo bàn phím và chuột công thái học cao cấp nhất của Logitech dành cho chuyên viên văn phòng. Kết nối đầu thu Logi Bolt mã hóa bảo mật cấp doanh nghiệp, chuyển đổi nhanh giữa 3 thiết bị máy tính, gõ phím êm ái chính xác.",
    countInStock: 150,
    rating: 4.9,
    numReviews: 45,
    specs: [
      { key: "Kết nối", value: "Đầu thu USB Logi Bolt an toàn mã hóa FIPS & Bluetooth Low Energy", group: "Kết nối" },
      { key: "Pin", value: "Pin sạc USB-C dùng liên tục lên đến 70 ngày", group: "Năng lượng" },
      { key: "Tương thích", value: "Windows 10/11, macOS, Linux, ChromeOS", group: "Tương thích" },
      { key: "Bảo hành", value: "24 Tháng chính hãng", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Thiết Bị Hội Nghị & Ngoại Vi",
    name: "Tai Nghe Họp & Call Center Chuyên Dụng Jabra Evolve2 65 Flex Không Dây",
    price: 6890000,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    description: "Tai nghe không dây chống ồn chủ động Hybrid ANC với thiết kế gập gọn siêu nhẹ chuyên dụng cho nhân sự làm việc linh hoạt hoặc tổng đài viên. Hệ thống 6 micro lọc tạp âm AI cao cấp, đèn báo bận Busylight 360 độ chống làm phiền.",
    countInStock: 80,
    rating: 4.8,
    numReviews: 17,
    specs: [
      { key: "Chống ồn", value: "Hybrid Active Noise Cancellation (ANC)", group: "Tính năng" },
      { key: "Microphone", value: "Hệ thống 6 microphones công nghệ Jabra ClearVoice", group: "Âm thanh" },
      { key: "Thời lượng pin", value: "Lên đến 32 giờ nghe nhạc, 20 giờ đàm thoại liên tục", group: "Năng lượng" },
      { key: "Bảo hành", value: "24 Tháng chính hãng Jabra", group: "Dịch vụ B2B" },
    ],
  },

  // --- NHÓM 4: MÁY IN & THIẾT BỊ SỐ HÓA ---
  {
    categoryName: "Máy In & Thiết Bị Số Hóa",
    name: "Máy In Laser Đa Năng Doanh Nghiệp HP LaserJet Pro MFP 4103fdw (In, Scan, Copy, Fax)",
    price: 11650000,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80",
    description: "Máy in laser đen trắng đa chức năng tốc độ cao lý tưởng cho văn phòng từ 10-30 người. Tốc độ in lên tới 40 trang/phút, in và quét 2 mặt tự động (Duplex), kết nối WiFi 2 băng tần, mạng LAN Gigabit và giải pháp bảo mật dữ liệu HP Wolf Pro Security.",
    countInStock: 55,
    rating: 4.7,
    numReviews: 28,
    specs: [
      { key: "Chức năng", value: "In mạng, Scan màu, Copy tự động, Fax", group: "Tính năng" },
      { key: "Tốc độ in", value: "40 trang/phút (khổ A4), in trang đầu trong 6.3 giây", group: "Hiệu năng" },
      { key: "In 2 mặt", value: "Tự động đảo mặt bản in (Automatic Duplex)", group: "Tính năng" },
      { key: "Khay nạp giấy", value: "Khay nạp tự động ADF 50 tờ + Khay tiêu chuẩn 250 tờ", group: "Phần cứng" },
      { key: "Bảo hành", value: "36 Tháng tận nơi HP Onsite Service", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Máy In & Thiết Bị Số Hóa",
    name: "Máy Quét Tài Liệu 2 Mặt Tự Động Canon imageFORMULA DR-C225 II",
    price: 8950000,
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    description: "Máy quét tài liệu chuyên nghiệp tốc độ cao nhỏ gọn nhất cho bàn làm việc kế toán và hành chính nhân sự. Thiết kế đường dẫn giấy J-Turn chữ U độc đáo, quét 2 mặt cùng lúc 50 hình ảnh/phút, nhận diện ký tự quang học OCR tiếng Việt chính xác.",
    countInStock: 40,
    rating: 4.8,
    numReviews: 16,
    specs: [
      { key: "Tốc độ quét", value: "25 trang/phút (50 hình ảnh/phút quét 2 mặt duplex)", group: "Hiệu năng" },
      { key: "Khay nạp ADF", value: "30 tờ giấy khổ A4 tự động", group: "Phần cứng" },
      { key: "Độ phân giải", value: "Quang học 600 x 600 dpi", group: "Chất lượng" },
      { key: "Phần mềm", value: "CaptureOnTouch & OCR tiếng Việt số hóa tự động", group: "Phần mềm" },
      { key: "Bảo hành", value: "12 Tháng chính hãng Canon Vietnam", group: "Dịch vụ B2B" },
    ],
  },

  // --- NHÓM 5: HẠ TẦNG MẠNG & LƯU TRỮ NAS ---
  {
    categoryName: "Hạ Tầng Mạng & Lưu Trữ Doanh Nghiệp",
    name: "Thiết Bị Lưu Trữ Mạng Doanh Nghiệp Synology DiskStation DS923+ 4 Khay",
    price: 16900000,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    description: "Hệ thống máy chủ lưu trữ NAS 4 khay mạnh mẽ cho doanh nghiệp SMB sao lưu tập trung, phân quyền dữ liệu và thiết lập đám mây riêng tư (Private Cloud). Vi xử lý AMD Ryzen R1600, RAM ECC DDR4 bảo vệ toàn vẹn dữ liệu, hỗ trợ nâng cấp mạng 10GbE.",
    countInStock: 35,
    rating: 4.9,
    numReviews: 21,
    specs: [
      { key: "CPU", value: "AMD Ryzen R1600 Dual-Core 2.6GHz (up to 3.1GHz)", group: "Hiệu năng" },
      { key: "RAM", value: "4GB DDR4 ECC SODIMM (Nâng cấp tối đa 32GB)", unit: "GB", group: "Bộ nhớ" },
      { key: "Khay ổ cứng", value: "4 khay đĩa 3.5/2.5 inch SATA (Mở rộng đến 9 khay với DX517)", group: "Lưu trữ" },
      { key: "Khe cắm đệm", value: "2x M.2 2280 NVMe SSD Cache tăng tốc đọc ghi I/O", group: "Lưu trữ" },
      { key: "Cổng mạng", value: "2x RJ-45 1GbE LAN (Hỗ trợ Link Aggregation & 10GbE Card)", group: "Mạng" },
      { key: "Bảo hành", value: "36 Tháng chính hãng Synology", group: "Dịch vụ B2B" },
    ],
  },
  {
    categoryName: "Hạ Tầng Mạng & Lưu Trữ Doanh Nghiệp",
    name: "Switch Doanh Nghiệp Quản Lý Cisco Catalyst CBS250-24P-4G Smart Switch 24 Cổng PoE+",
    price: 15400000,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    description: "Switch mạng quản lý layer 2 thế hệ mới chuẩn doanh nghiệp Cisco Business CBS250. Cung cấp 24 cổng Gigabit Ethernet hỗ trợ cấp nguồn PoE+ công suất 195W cho hệ thống Camera IP và bộ phát WiFi, kèm 4 cổng quang SFP Uplink tốc độ cao.",
    countInStock: 45,
    rating: 5.0,
    numReviews: 11,
    specs: [
      { key: "Cổng kết nối", value: "24 cổng 10/100/1000 PoE+ (Tổng công suất 195W) + 4 cổng Gigabit SFP", group: "Cổng mạng" },
      { key: "Băng thông", value: "Công suất chuyển mạch 56 Gbps, 41.66 Mpps", group: "Hiệu năng" },
      { key: "Tính năng quản lý", value: "VLAN 802.1Q, QoS 802.1p, IGMP Snooping, Cisco Business Dashboard", group: "Quản trị" },
      { key: "Bảo mật", value: "802.1X Port Security, DoS Prevention, SSL/SSH", group: "Bảo mật" },
      { key: "Bảo hành", value: "Bảo hành trọn đời có giới hạn (Cisco Limited Lifetime)", group: "Dịch vụ B2B" },
    ],
  },
];

async function seedB2BCatalog() {
  console.log("==========================================================================");
  console.log("🚀 BẮT ĐẦU SEED DỮ LIỆU B2B PROCUREMENT CHO DOANH NGHIỆP...");
  console.log("==========================================================================");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB Atlas thành công!");

    // 1. Dọn sạch dữ liệu cũ
    console.log("\n🧹 1. Dọn dẹp dữ liệu danh mục & sản phẩm cũ...");
    const oldCategoriesCount = await Category.countDocuments();
    const oldProductsCount = await Product.countDocuments();
    const oldSpecsCount = await Specification.countDocuments();
    console.log(`- Tìm thấy hiện tại: ${oldCategoriesCount} Categories, ${oldProductsCount} Products, ${oldSpecsCount} Specifications`);

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Specification.deleteMany({});
    console.log("✅ Đã làm sạch toàn bộ bảng Catalog cũ.");

    // 2. Tạo 5 Danh mục B2B
    console.log("\n📦 2. Đang khởi tạo 5 Danh mục B2B Doanh nghiệp...");
    const categoryMap = new Map();
    for (const catData of b2bCategories) {
      const createdCat = await Category.create(catData);
      categoryMap.set(createdCat.name, createdCat._id);
      console.log(`   + [Category] ${createdCat.name} (ID: ${createdCat._id})`);
    }

    // 3. Tạo Sản phẩm B2B và liên kết Specifications
    console.log("\n💻 3. Đang khởi tạo các Sản phẩm B2B cao cấp kèm Thông số Kỹ thuật...");
    let productSuccessCount = 0;
    let specSuccessCount = 0;

    for (const prodData of b2bProducts) {
      const categoryId = categoryMap.get(prodData.categoryName);
      if (!categoryId) {
        console.warn(`⚠️ Cảnh báo: Không tìm thấy category "${prodData.categoryName}" cho sản phẩm "${prodData.name}"`);
        continue;
      }

      // 3.1 Tạo bản ghi Product trước để lấy _id
      const newProduct = new Product({
        name: prodData.name,
        price: prodData.price,
        image: prodData.image,
        category: categoryId,
        description: prodData.description,
        countInStock: prodData.countInStock,
        rating: prodData.rating,
        numReviews: prodData.numReviews,
        specifications: [],
      });
      await newProduct.save();

      // 3.2 Tạo các bản ghi Specification liên kết với Product này
      const specIds = [];
      if (Array.isArray(prodData.specs) && prodData.specs.length > 0) {
        for (const specItem of prodData.specs) {
          const specDoc = await Specification.create({
            product: newProduct._id,
            key: specItem.key,
            value: specItem.value,
            unit: specItem.unit || "",
            group: specItem.group || "Chung",
          });
          specIds.push(specDoc._id);
          specSuccessCount++;
        }
      }

      // 3.3 Cập nhật mảng specifications vào Product
      newProduct.specifications = specIds;
      await newProduct.save();

      productSuccessCount++;
      const priceFormatted = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(newProduct.price);
      console.log(`   + [Product] ${newProduct.name}`);
      console.log(`     -> Giá: ${priceFormatted} | Tồn kho: ${newProduct.countInStock} | ${specIds.length} Thông số kỹ thuật`);
    }

    console.log("\n==========================================================================");
    console.log("🎉 SEED DỮ LIỆU B2B HOÀN TẤT THÀNH CÔNG!");
    console.log(`📊 Tổng kết:`);
    console.log(`   - Danh mục B2B: ${categoryMap.size} danh mục`);
    console.log(`   - Sản phẩm Doanh nghiệp: ${productSuccessCount} sản phẩm`);
    console.log(`   - Thông số Kỹ thuật liên kết: ${specSuccessCount} thông số`);
    console.log("==========================================================================");

    await mongoose.disconnect();
    console.log("🔒 Đã ngắt kết nối MongoDB an toàn.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seed dữ liệu:", error);
    process.exit(1);
  }
}

seedB2BCatalog();
