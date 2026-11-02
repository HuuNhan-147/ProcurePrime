# 🛡️ CHÍNH SÁCH QUẢN TRỊ & POLICY ENGINE (GOVERNANCE & POLICIES)
> **Dự án:** **ProcurePrime**  
> **Kế thừa kiến trúc:** Escalation Referee & Decision Protocol từ `EDUREF_AI`  
> **Phiên bản chính sách:** `PROCUREPRIME_GOVERNANCE_V1.0.0`

---

## 1. NGUYÊN TẮC BẤT KHẢ XÂM PHẠM (CORE AXIOMS)
1. **LLM không bao giờ tự ý quyết định giao dịch tài chính:** Mô hình ngôn ngữ lớn (Gemini) chỉ có vai trò đề xuất, phân tích và trích xuất. Toàn bộ quyết định cho phép thực thi (`ROUTE`), dừng lại hỏi (`ASK`), từ chối (`REJECT`), hoặc chuyển tiếp cấp trên (`ESCALATE`) phải được thẩm định bằng mã nguồn Backend tất định (Deterministic Code).
2. **Không vượt trần ngân sách âm thầm:** Hệ thống tuyệt đối không tự ý gom giỏ hàng hoặc chốt đơn vượt quá ngân sách trần ($Max\ Budget$) đã được người dùng chỉ định.
3. **Mọi quyết định đều có thể giải trình (Explainable Audit Trail):** Mỗi phán quyết của Policy Engine đều gắn liền với 1 mã điều khoản (`rule`), 1 lý do bằng ngôn ngữ tự nhiên (`reason`), và 1 mã băm SHA-256 (`evidenceFingerprint`) lưu vết trong cơ sở dữ liệu.

---

## 2. BỘ TỨ QUYẾT ĐỊNH (THE 4 CANONICAL DECISIONS)

```
                     ┌──────────────────────────────────────────────┐
                     │          YÊU CẦU THU MUA DOANH NGHIỆP        │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          PROCUREMENT POLICY ENGINE           │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌───────────────────┬──────────────┴──────────────┬───────────────────┐
         ▼                   ▼                             ▼                   ▼
  [AUTO_APPROVED]   [ASK_CLARIFICATION]            [REJECTED_POLICY]   [ESCALATE_TO_STAFF]
   (Cho phép)          (Hỏi làm rõ)                   (Từ chối)           (Chuyển tiếp)
```

| Quyết định | Ký hiệu | Điều kiện kích hoạt | Hành động của Hệ thống |
| :--- | :---: | :--- | :--- |
| **`AUTO_APPROVED`** | `ROUTE` | • Đầy đủ thông số kỹ thuật (RAM, CPU, số lượng).<br>• Tổng dự toán $\le 50.000.000$ VNĐ.<br>• Nằm trong ngân sách phòng ban và danh mục được phép. | Kích hoạt công cụ `bulk_add_to_cart` (WebMCP) và lập Báo giá Doanh nghiệp tự động. |
| **`ASK_CLARIFICATION`** | `ASK` | • Thiếu thông số quan trọng (chưa rõ số lượng, chưa rõ RAM/SSD).<br>• Khách hàng chỉ đang hỏi dò thông tin giá cả (`isInquiry: true`).<br>• Phát hiện mâu thuẫn giữa nhu cầu sử dụng và loại máy (VD: Đồ họa 3D nhưng chọn máy Celeron). | Dừng tự động hóa, gửi phản hồi bằng câu hỏi gợi ý làm rõ nhu cầu. |
| **`REJECTED_POLICY`** | `REJECT` | • Yêu cầu thiết bị nằm trong danh mục cấm/ngừng kinh doanh.<br>• Tài khoản bị khóa quyền thu mua.<br>• Ngân sách trần $< 0$ hoặc không hợp lệ. | Từ chối dứt khoát kèm điều khoản quy định rõ ràng. |
| **`ESCALATE_TO_STAFF`** | `ESCALATE` | • Đơn hàng giá trị từ $50$ đến $200$ triệu VNĐ $\rightarrow$ Gửi Trưởng phòng Mua hàng.<br>• Đơn hàng $> 200$ triệu VNĐ $\rightarrow$ Gửi Giám đốc Tài chính (CFO).<br>• Đơn hàng vượt trần ngân sách nhưng có lý do kinh doanh đặc biệt.<br>• Yêu cầu chiết khấu sỉ ngoài khung ($> 10\%$). | Đóng gói toàn bộ snapshot hồ sơ, tạo yêu cầu phê duyệt kèm câu hỏi hành động (`actionableQuestion`). |

---

## 3. BẢNG PHÂN CẤP THẨM QUYỀN PHÊ DUYỆT (AUTHORITY MATRIX)

| Giá trị Đơn hàng Thu mua | Người có thẩm quyền quyết định | Quyết định của Policy Engine | Thời gian phản hồi cam kết |
| :--- | :--- | :---: | :---: |
| **Dưới 50.000.000 VNĐ** | **AI Agent (ProcurePrime)** | `AUTO_APPROVED` | **Tức thì (< 3 giây)** |
| **50.000.000 – 200.000.000 VNĐ** | **Trưởng phòng Mua hàng (Procurement Lead)** | `ESCALATE_TO_STAFF` (`targetRole: 'MANAGER'`) | Trong vòng 4 giờ |
| **Trên 200.000.000 VNĐ** | **Giám đốc Tài chính (CFO / Director)** | `ESCALATE_TO_STAFF` (`targetRole: 'CFO'`) | Trong vòng 24 giờ |
| **Chiết khấu đặc biệt (> 10%)** | **Giám đốc Kinh doanh (Sales Director)** | `ESCALATE_TO_STAFF` (`targetRole: 'SALES_DIR'`) | Trong vòng 12 giờ |

---

## 4. HỢP ĐỒNG PHÁN QUYẾT CHUẨN (DECISION SCHEMA CONTRACT)

Mỗi lần kiểm tra quy chế, `ProcurementPolicyEngine` xuất ra một đối tượng JSON chuẩn:

```typescript
export interface PolicyDecisionResult {
  decision: 'AUTO_APPROVED' | 'ASK_CLARIFICATION' | 'REJECTED_POLICY' | 'ESCALATE_TO_STAFF';
  classification: 'ROUTINE' | 'UNKNOWN_FACT' | 'ROUTINE_POLICY_DENY' | 'OUTSIDE_POLICY' | 'BEYOND_AUTHORITY';
  rule: string;                   // Ví dụ: 'POL_BUDGET_EXCEEDED_ESCALATE_CFO'
  reason: string;                 // Giải thích ngắn gọn cho người dùng / cán bộ
  actionableQuestion?: string;    // Câu hỏi trọng tâm để cấp trên duyệt trong 1 click
  targetRole?: 'STAFF' | 'MANAGER' | 'CFO' | 'SALES_DIR';
  budgetUtilization?: {
    allocatedBudget: number;
    estimatedCost: number;
    variance: number;
    variancePercent: number;
  };
  evidenceFingerprint: string;    // Mã băm SHA-256 snapshot dữ liệu đầu vào
  timestamp: string;
}
```

---

## 5. CƠ CHẾ GHI VẾT SUY LUẬN & HOÀN TÁC (AUDIT TRAIL & ROLLBACK)

1. **Snapshot Fingerprint:** Mọi tham số đầu vào (Danh mục sản phẩm, số lượng, đơn giá, ngân sách trần, người yêu cầu) được chuẩn hóa và sinh mã băm SHA-256:
   $$\text{Fingerprint} = \text{SHA256}(\text{CanonicalJSON}(\text{InputSnapshot}))$$
2. **Audit Log Persistence:** Lưu trữ vết vào CSDL MongoDB collection `audit_logs` trước khi bất kỳ thao tác giỏ hàng hay báo giá nào được kích hoạt.
3. **Rollback 1 Chạm:** Cho phép người quản trị hoàn tác toàn bộ các mặt hàng được thêm tự động nếu phát hiện sai sót trong quá trình AI đề xuất.

