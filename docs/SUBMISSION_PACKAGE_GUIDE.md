# 📦 HƯỚNG DẪN ĐÓNG GÓI VÀ NỘP BÀI THI LIKELION HACKATHON 2026
> **Cuộc thi:** K-Tech College 2026 — AI for Business Innovation Hackathon  
> **Chủ đề:** *Solve Real Business Problems with AI*  
> **Đội thi (Team):** **AgentX Prime**  
> **Dự án:** **ProcurePrime**  
> **Hạn chót nộp bài (Deadline):** **23:59 ngày 13.11.2026**  
> **Link nộp bài chính thức:** [https://forms.gle/cHohmzAL8KcWmKWC8](https://forms.gle/cHohmzAL8KcWmKWC8) (Dự phòng: [Link dự phòng](https://forms.gle/Umw8fjnZrrxcy2op7))

---

## 📋 1. QUY CHUẨN ĐẶT TÊN VÀ ĐÓNG GÓI HỒ SƠ

Theo điều 8 của Thể lệ cuộc thi:
* **Tên thư mục nộp bài:** Bắt buộc đặt theo cấu trúc `AI4Biz_Tendoi_2026`  
  👉 **Tên chính thức của đội:** `AI4Biz_AgentXPrime_2026`
* **Hình thức lưu trữ:** Đặt toàn bộ tài liệu và video demo vào một thư mục trên Google Drive của Trưởng nhóm, bật quyền chia sẻ: **"Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view)** để Ban Giám Khảo truy cập chấm điểm không bị chặn quyền.

---

## 📂 2. CẤU TRÚC THƯ MỤC NỘP BÀI (`AI4Biz_AgentXPrime_2026`)

Khi nộp qua Google Form, thư mục Google Drive của đội cần có đầy đủ 4 thành phần sau:

```
📁 AI4Biz_AgentXPrime_2026/
├── 📄 01_SlideDeck_ProcurePrime_EN.pdf         <-- File Slide thuyết trình (Tiếng Anh, <= 15 slide, xuất từ docs/HACKATHON_SLIDE_DECK_EN.md)
├── 🎬 02_Demo_Video_2Minutes.mp4               <-- Video demo sản phẩm thực tế (Chính xác 120s, quay theo docs/DEMO_SCRIPT_2_MINUTES.md)
├── 📄 03_Project_Documentation_README.pdf      <-- Bản PDF xuất từ README.md (Đặc tả bài toán, giải pháp, kiến trúc, kiểm thử 27 tests)
└── 🔗 04_SourceCode_and_LiveMVP_Link.txt       <-- File text chứa link GitHub Repo, link chạy Live MVP và tài khoản Demo
```

---

## 📝 3. HƯỚNG DẪN XUẤT FILE SLIDE DECK (PDF)

1. Mở file mã nguồn Slide tiếng Anh: [`docs/HACKATHON_SLIDE_DECK_EN.md`](HACKATHON_SLIDE_DECK_EN.md).
2. Copy toàn bộ nội dung 13 slide vào công cụ thiết kế yêu thích (Canva, Google Slides, Microsoft PowerPoint hoặc Gamma App).
3. Áp dụng bảng màu thương hiệu của ProcurePrime:
   - Màu nền chủ đạo: **Deep Slate / Dark Navy** (`#0f172a`).
   - Màu điểm nhấn công nghệ: **Electric Cyan / Emerald Green** (`#06b6d4` / `#10b981`).
   - Phông chữ tiêu đề: **Inter** hoặc **Montserrat** (In đậm, dứt khoát).
4. Kiểm tra đảm bảo tổng số slide **$\le 15$ slides** (Slide của đội hiện tại là 13 slides chuẩn).
5. Xuất file với định dạng **PDF** và đặt tên: `01_SlideDeck_ProcurePrime_EN.pdf`.

---

## 🎬 4. HƯỚNG DẪN QUAY VIDEO DEMO (MP4)

1. Đọc kỹ kịch bản phân cảnh: [`docs/DEMO_SCRIPT_2_MINUTES.md`](DEMO_SCRIPT_2_MINUTES.md).
2. Khởi chạy cả Backend và Frontend trên máy:
   - Backend: `npm start` tại thư mục `backend` (Cổng 5000).
   - Frontend: `npm run dev` tại thư mục `frontend` (Cổng 5173).
3. Sử dụng phần mềm quay màn hình chất lượng cao (OBS Studio hoặc Loom) ở độ phân giải tối thiểu **1080p (Full HD)**.
4. Đảm bảo âm thanh thu giọng thuyết minh to, rõ, dứt khoát, không bị rè hoặc lẫn tạp âm.
5. Cắt gọt video để tổng thời lượng nằm trong khoảng **từ 1 phút 50 giây đến tối đa 2 phút 00 giây**.
6. Đặt tên file: `02_Demo_Video_2Minutes.mp4`.

---

## 🧪 5. CHECKLIST KIỂM CHỨNG KỸ THUẬT TRƯỚC KHI NỘP

Trước khi nhấn nút gửi form, hãy chạy lệnh kiểm thử trên terminal để đảm bảo 100% chức năng sẵn sàng:

```powershell
cd "D:\HACKATHON\LIKELION-HACKATHON\ProcurePrime\backend"
node --test tests/foundation.test.js tests/domain.test.js tests/quotation.test.js tests/governance.test.js
```
* [x] **27/27 Unit Tests passed 100%**.
* [x] Đã kiểm thử `simulatePolicy` với cả 2 Tenant `tenant_techcorp` và `tenant_steelcorp`.
* [x] Kiểm tra giao diện Quản trị `/admin/policies` tải mượt mà không có lỗi console.
* [x] Kiểm tra tương tác WebMCP giỏ hàng nhảy số trực tiếp trên Header.
* [x] Tài khoản Admin mặc định hoạt động: `admin@procureprime.vn` / `Admin@123456`.

---

## 🚀 6. SẴN SÀNG CHO VÒNG CHUNG KẾT (FINAL PITCH - 19.11)

* **Địa điểm:** Cobi Home (Lô DV-4, Đường trung tâm, KCN, Cần Giuộc, Tây Ninh).
* **Điểm tập trung xe trung chuyển:** Cobi Tower 2 (2-4 Đường Số 8, KĐT Phú Mỹ Hưng, Tân Mỹ, TP.HCM).
* **Thời lượng trình bày:** 15 phút (Slide + Video Demo 2 phút) + 5 phút Q&A với Ban Giám Khảo.
* **Ngôn ngữ thuyết trình:** Tiếng Anh.
* **Trang phục:** Smart Casual.
* **Mục tiêu:** Giành **Giải Nhất (MacBook Neo 13 inch A18 Pro 2026)**! 🏆

