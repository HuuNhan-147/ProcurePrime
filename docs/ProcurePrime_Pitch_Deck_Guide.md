# 🏆 PROCUREPRIME: AUTONOMOUS B2B PROCUREMENT & SMART QUOTATION AGENT FOR ENTERPRISES
> **Đội thi (Team):** **AgentX Prime**  
> **Sản phẩm (Product):** **ProcurePrime**  
> **Cuộc thi:** Likelion Hackathon 2026 — AI for Business Innovation  
> **Lĩnh vực / Bài toán kinh doanh:** Supply Chain & Logistics (hoặc Operations & Productivity)  
> **Slogan / Tagline:** *"Empowering Enterprise Purchasing with Autonomous AI & Zero-Latency WebMCP"*

---

## 1. THÔNG TIN ĐIỀN FORM ĐĂNG KÝ HACKATHON

| Trường thông tin | Nội dung đăng ký chuẩn chỉnh |
| :--- | :--- |
| **Tên đội (Team Name)** | `AgentX Prime` |
| **Tên đề tài / Dự án (Project Title)** | `ProcurePrime: Autonomous B2B Procurement & Smart Quotation Agent for Enterprises` |
| **Tên tiếng Việt (Phụ đề)** | *Trợ lý AI Tự hành Tối ưu hóa Thu mua & Báo giá B2B cho Doanh nghiệp* |
| **Lĩnh vực kinh doanh (Track)** | `Supply Chain & Logistics` *(hoặc: `Operations & Productivity`)* |
| **Tóm tắt giá trị cốt lõi (Elevator Pitch)** | ProcurePrime giải quyết nút thắt mua sắm thiết bị tốn 3–5 ngày của các doanh nghiệp SME/Enterprise bằng Tác tử AI Tự hành: Tự động phân tích nhu cầu theo phòng ban/dự án, khớp cấu hình trong trần ngân sách, gom giỏ hàng B2B số lượng lớn tức thì qua công nghệ WebMCP và xuất báo giá doanh nghiệp (Quotation) chuẩn thuế VAT trong vòng 30 giây. |

---

## 2. KỊCH BẢN DEMO "ĂN ĐIỂM" BAN GIÁM KHẢO (CHỈ 2 PHÚT)

Khi thuyết trình hoặc quay video demo trực tiếp, hãy làm chính xác theo 4 nhịp sau để chứng minh năng lực thực chiến:

```
[00:00 - 00:30]   ĐẶT VẤN ĐỀ (PAIN POINT)
                  Nêu nỗi đau của Phòng Mua hàng/IT Lead: Phải tự gom hàng chục món,
                  cân đo ngân sách và chờ báo giá thủ công mất 3-5 ngày.

[00:30 - 01:15]   RA ĐỀ BÀI PHỨC TẠP & AI SUY LUẬN REACT
                  User nhập một câu tự nhiên có nhiều ràng buộc cấu hình và ngân sách trần.

[01:15 - 01:40]   KHOẢNH KHẮC "WOW" VỚI WEBMCP (ZERO-LATENCY)
                  ProcurePrime gọi bulk_add_to_cart -> Giỏ hàng tự động nhảy 10 món
                  ngay trước mắt Ban giám khảo mà không reload trang.

[01:40 - 02:00]   XUẤT BÁO GIÁ DOANH NGHIỆP & CHỐT ĐƠN (VALUE IMPACT)
                  Bảng báo giá B2B chiết khấu sỉ 5%, VAT 10% xuất hiện sẵn sàng trình Sếp duyệt
                  hoặc thanh toán đặt cọc qua VNPay.
```

### Chi tiết các bước Demo:

* **Bước 1 (Nhấp nút Quick Prompt trên màn hình):**
  > *"Công ty tôi vừa mở văn phòng mới, cần trang bị cho 5 nhân viên: 5 laptop văn phòng (RAM tối thiểu 16GB), 5 bộ chuột phím không dây. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT cho Công ty TNHH Giải Pháp AI."*

* **Bước 2 (Quan sát AI Agent ReAct suy luận):**
  - AI đọc hiểu các ràng buộc: Số lượng ($N=5$), chủng loại (Laptop RAM 16GB + Chuột phím), ngân sách tối đa ($90.000.000$ VNĐ).
  - AI tự động gọi tool `search_products` tìm các mã Laptop và Chuột phù hợp.
  - AI tính nhẩm tổng ngân sách: Ví dụ $5 \times 15.000.000 + 5 \times 500.000 = 77.500.000 \le 90.000.000$ VNĐ.

* **Bước 3 (Khoảnh khắc WebMCP tỏa sáng):**
  - AI tự kích hoạt tool `bulk_add_to_cart`.
  - Trên thanh Header, icon Giỏ hàng tự động nhảy số từ **0** lên **10** (5 laptop + 5 chuột) trong nháy mắt.

* **Bước 4 (Giá trị doanh nghiệp vượt trội):**
  - Tự động áp dụng **B2B Volume Discount** (giảm 5% cho đơn số lượng lớn).
  - Hiển thị bảng **Báo Giá Doanh Nghiệp (Commercial Quotation)** có đủ: Đơn giá sỉ, Tạm tính, Chiết khấu B2B, Thuế VAT 10%, và Tổng chi phí dự toán.
  - Điều hướng 1-click vào trang Thanh toán đặt cọc qua cổng **VNPay**.

---

## 3. CẤU TRÚC 5 SLIDE CHUẨN QUỐC TẾ (TIẾNG ANH) CHO SLIDE DECK

### Slide 1: Title & Vision
* **Headline:** ProcurePrime — Autonomous B2B Procurement & Smart Quotation Agent
* **Sub-headline:** Streamlining Enterprise Equipment Purchasing with Zero-Latency WebMCP
* **Team:** AgentX Prime
* **Key Visual:** Hình ảnh kiến trúc tương tác giữa Business User $\leftrightarrow$ ProcurePrime $\leftrightarrow$ E-Commerce Core & WebMCP.

### Slide 2: The Multi-Billion Dollar Business Problem
* **The Enterprise Pain Point:**
  - Quy trình thu mua B2B hiện tại rất phân mảnh: Tìm kiếm thủ công, tính toán ngân sách bằng Excel, email qua lại chờ báo giá từ Sales mất **3–5 ngày làm việc**.
  - Tỉ lệ rớt đơn do độ trễ báo giá lên đến **42%** trong thương mại điện tử doanh nghiệp.
* **Target Users:** SME Owners, IT Leads, HR Managers, Procurement Officers.

### Slide 3: The Innovation — Autonomous ReAct & WebMCP Dual-Path
* **ReAct Multi-step Reasoning:** Đọc hiểu các ràng buộc phức tạp (Budget cap, Brand, Specifications, Quantities).
* **Zero-Latency WebMCP Architecture:** Cho phép AI điều khiển trực tiếp DOM và Client API của trình duyệt, cập nhật trạng thái giỏ hàng mà không cần polling hay reload trang.
* **Automated B2B Quotation Engine:** Tự tính chiết khấu theo khối lượng (Volume discount) và sinh báo giá chuẩn thuế VAT ngay trong phiên chat.

### Slide 4: Business Impact & Market Viability
* **Efficiency:** Rút ngắn thời gian từ nhu cầu $\rightarrow$ báo giá từ **72 giờ xuống dưới 60 giây** (giảm 99% thời gian chờ).
* **Revenue Opportunity:** Mô hình doanh thu từ hoa hồng đơn hàng B2B (Take-rate 2–4%) + Gói thuê bao Enterprise SaaS (Advanced ERP integration).
* **Proven Feasibility (MVP):** Nền tảng hoạt động thực tế 100% với fullstack React 19 + Express + MongoDB + VNPay Sandbox.

### Slide 5: Roadmap & Future Expansion
* **Phase 1 (Current MVP):** Sourcing thông minh, WebMCP bulk cart, Instant quotation, VNPay.
* **Phase 2 (Next 3 months):** Tích hợp OCR đọc file Excel danh mục thiết bị của khách hàng, kết nối ERP (SAP, Odoo).
* **Phase 3 (Next 6 months):** Đàm phán giá tự động giữa Buyer Agent và Supplier Agent qua giao thức tác tử (Agent-to-Agent Protocol).

---

## 4. BẢNG PHẢN BIỆN & BẢO VỆ TRƯỚC GIÁM KHẢO (Q&A DEFENSE)

### Câu hỏi 1: *"Hệ thống này khác gì một chatbot tìm kiếm sản phẩm thông thường?"*
* **Trả lời:** Chatbot thông thường chỉ trả lời dạng text đơn lẻ cho người mua cá nhân (B2C) và bắt người dùng tự bấm từng món vào giỏ. ProcurePrime là **Tác tử tự hành B2B (Autonomous Agent)**: Nó giải quyết bài toán tối ưu hóa đa biến (nhiều sản phẩm, số lượng lớn, trần ngân sách), tự quyết định gọi tool gom giỏ hàng qua **WebMCP** và sinh ra chứng từ thương mại (Báo giá B2B) có giá trị giao dịch doanh nghiệp.

### Câu hỏi 2: *"Công nghệ WebMCP giải quyết vấn đề gì vượt trội so với gọi API truyền thống?"*
* **Trả lời:** WebMCP cho phép Server AI Agent ủy quyền các tác vụ giao diện trực tiếp xuống Runtime của trình duyệt người dùng. Thay vì bắt client reload trang hoặc polling liên tục làm tăng tải server, WebMCP thực thi trên state của Client với độ trễ gần như bằng 0 (Zero-latency), mang lại trải nghiệm tương tác liền mạch theo thời gian thực.

### Câu hỏi 3: *"Tính khả thi và khả năng scale của dự án như thế nào?"*
* **Trả lời:** Dự án được xây dựng trên kiến trúc Module hóa (Decoupled Architecture), backend và frontend tách biệt. AI Agent hoạt động theo chuẩn ReAct Tool-Calling, dễ dàng cắm thêm các nhà cung cấp nguồn hàng khác (Multi-vendor API) hoặc tích hợp với các hệ thống ERP doanh nghiệp qua giao thức MCP chuẩn mở.

