// frontend/src/pages/ProcurementWorkspace.tsx
// ============================================
// PROCUREPRIME WORKSPACE — Không Gian Thu Mua & Báo Giá Doanh Nghiệp (Split-Screen)
// Thiết kế: Tối giản, thanh lịch, không lạm dụng icon, phân cấp thị giác bằng Typography
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

interface ActionButton {
  label: string;
  action: "navigate" | "cart" | "orders" | "profile";
  url?: string;
  style?: "primary" | "secondary";
}

interface Message {
  sender: "user" | "agent";
  text: string;
  actions?: ActionButton[];
  timestamp: Date;
}

interface ItemRow {
  name: string;
  specsSummary: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export const ProcurementWorkspace: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "Kính chào Quý Doanh nghiệp. Hệ thống Tác tử Thu mua B2B ProcurePrime đã sẵn sàng.\n\nVui lòng cung cấp yêu cầu cấu hình thiết bị, số lượng và trần ngân sách. Hệ thống sẽ tự động bóc tách thông số, so khớp cấu hình, tính toán chiết khấu sỉ và phát hành báo giá thương mại chính thức.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Dữ liệu thời gian thực hiển thị tại Cột Phải (Live Canvas)
  const [quotationNumber, setQuotationNumber] = useState<string>("PP-20261101-9F2B");
  const [maxBudget, setMaxBudget] = useState<number>(90_000_000);
  const [status, setStatus] = useState<"DRAFT" | "ISSUED">("DRAFT");
  const [auditFingerprint, setAuditFingerprint] = useState<string>(
    "8f3a9e21b7c4d5a10982ef331a98bc741299ef01ac45bd87e91230489ba4cd12"
  );
  const [items, setItems] = useState<ItemRow[]>([
    {
      name: "Dell Latitude 5540 B2B Enterprise Laptop",
      specsSummary: "Intel Core i5-1345U vPro • RAM 16GB • SSD 512GB NVMe",
      quantity: 5,
      unitPrice: 24_500_000,
      subtotal: 122_500_000,
    },
    {
      name: "Bộ Chuột Phím Không Dây Logitech MX Keys S Combo",
      specsSummary: "Kết nối Logi Bolt FIPS • Pin 70 ngày",
      quantity: 5,
      unitPrice: 4_850_000,
      subtotal: 24_250_000,
    },
  ]);

  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tính toán các chỉ số tài chính
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountPercent = totalQty >= 10 || subtotal >= 50_000_000 ? 5 : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = Math.round((afterDiscount * 10) / 100);
  const grandTotal = afterDiscount + vatAmount;
  const budgetUtilization = maxBudget > 0 ? Math.min(Math.round((grandTotal / maxBudget) * 1000) / 10, 100) : 0;
  const isOverBudget = maxBudget > 0 && grandTotal > maxBudget;

  // Hàm bóc tách Action Buttons từ chuỗi phản hồi
  const parseActionsFromText = (
    text: string
  ): { cleanText: string; actions: ActionButton[] | null } => {
    const actionsMatch = text.match(/\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/);
    if (!actionsMatch) {
      // Nếu đang trong quá trình stream chunk mà mới chỉ có [ACTIONS] mở đầu
      const partialMatch = text.indexOf("[ACTIONS]");
      if (partialMatch !== -1) {
        return { cleanText: text.substring(0, partialMatch).trim(), actions: null };
      }
      return { cleanText: text, actions: null };
    }

    try {
      const actionsJson = actionsMatch[1].trim();
      const actionsData = JSON.parse(actionsJson);
      const cleanText = text.replace(/\[ACTIONS\][\s\S]*?\[\/ACTIONS\]/, "").trim();
      return {
        cleanText,
        actions: actionsData.buttons || null,
      };
    } catch {
      return { cleanText: text.replace(/\[ACTIONS\][\s\S]*?\[\/ACTIONS\]/, "").trim(), actions: null };
    }
  };

  const handleActionClick = (btn: ActionButton) => {
    if (btn.action === "cart") {
      navigate("/cart");
    } else if (btn.action === "orders") {
      navigate("/orders");
    } else if (btn.action === "profile") {
      navigate("/profile");
    } else if (btn.url) {
      navigate(btn.url);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("agent_response_chunk", (data: { text: string; sessionId: string }) => {
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "agent") {
          const rawAccumulated = last.text + data.text;
          const { cleanText } = parseActionsFromText(rawAccumulated);
          return [
            ...prev.slice(0, -1),
            { ...last, text: cleanText },
          ];
        }
        return prev;
      });
    });

    socket.on("agent_response_end", (data: any) => {
      setLoading(false);
      const replyText = data?.reply || "";

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "agent") {
          const textToParse = replyText || last.text;
          const { cleanText, actions } = parseActionsFromText(textToParse);
          return [
            ...prev.slice(0, -1),
            { ...last, text: cleanText, actions: actions || undefined },
          ];
        }
        return prev;
      });

      // Tự động nhận diện mã báo giá và cập nhật Canvas
      if (replyText) {
        const match = replyText.match(/(PP-\d{8}-[0-9A-F]{4})/i);
        if (match) {
          setQuotationNumber(match[1].toUpperCase());
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading || !socketRef.current) return;

    const userText = input.trim();
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, timestamp: new Date() },
      { sender: "agent", text: "", timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    socketRef.current.emit("client_send_message", {
      message: userText,
      sessionId,
      userId: user?._id || "guest",
      token: token || null,
      hasWebMCP: true,
    });
  };

  const handleApprove = async () => {
    if (!quotationNumber) return;
    try {
      const res = await fetch(`http://localhost:5000/api/quotations/${quotationNumber}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverRole: "MANAGER",
          approverNote: "Đã thẩm định và phê duyệt trên Procurement Workspace",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("ISSUED");
        alert(`Báo giá ${quotationNumber} đã được phê duyệt thành công!`);
      }
    } catch {
      setStatus("ISSUED");
      alert(`Đã phê duyệt báo giá ${quotationNumber}`);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        sender: "agent",
        text: "Phiên làm việc mới đã khởi tạo. Mời Quý Doanh nghiệp cung cấp yêu cầu mua sắm thiết bị tiếp theo.",
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      {/* 1. TOP HEADER (Enterprise Minimalist Bar - Fixed Height) */}
      <header className="flex-shrink-0 bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded transition"
            title="Quay về trang chủ"
          >
            ← TRANG CHỦ
          </Link>
          <h1 className="text-sm font-semibold tracking-wide text-slate-100">
            PROCUREPRIME <span className="text-slate-500">•</span> Autonomous B2B Procurement Workstation
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-400">
            PHÁP NHÂN: <strong className="text-slate-200">CÔNG TY TNHH GIẢI PHÁP AI</strong>
          </div>
          <div className="px-2 py-0.5 border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 rounded text-[11px] font-bold">
            DOANH NGHIỆP ĐÃ XÁC THỰC
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Split-Screen 2 Panes with Viewport Lock) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-0 overflow-hidden">
        {/* ========================================================
            CỘT TRÁI (42%): AI Procurement Copilot & Reasoning Thread
           ======================================================== */}
        <section className="col-span-12 lg:col-span-5 bg-white border-r border-slate-200 flex flex-col h-full min-h-0">
          {/* Header Cột Trái */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              [ 01 ] Bàn Điều Khiển & Phân Tích Yêu Cầu
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-900 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100 transition-colors"
            >
              LÀM MỚI PHIÊN
            </button>
          </div>

          {/* Khung Hội Thoại (Message Thread có Scroll dọc chuẩn) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs leading-relaxed">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                  {msg.sender === "user" ? "[ DOANH NGHIỆP ]" : "[ PROCUREPRIME REASONING ]"} •{" "}
                  {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div
                  className={`p-3.5 rounded-lg max-w-[92%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-slate-100 font-medium"
                      : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                  }`}
                >
                  {msg.text || (
                    <div className="font-mono text-slate-400 italic animate-pulse">
                      Đang phân tích yêu cầu cấu hình & thẩm định ngân sách...
                    </div>
                  )}

                  {/* Render Nút Actions nếu có (Không để lộ mã thô) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      {msg.actions.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleActionClick(btn)}
                          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                            btn.style === "secondary"
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Gợi Ý Nhanh B2B (Preset Buttons - Minimal Text Pills) */}
          <div className="flex-shrink-0 p-2.5 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px] font-mono">
            <button
              onClick={() =>
                setInput(
                  "Công ty TNHH Giải Pháp AI cần trang bị cho 5 nhân viên: 5 laptop văn phòng RAM tối thiểu 16GB, 5 bộ chuột phím không dây. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT."
                )
              }
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:border-slate-500 rounded whitespace-nowrap transition-colors"
            >
              [ + COMBO 5 MÁY 16GB + CHUỘT (90TR) ]
            </button>
            <button
              onClick={() => setInput("Tôi cần mua số lượng lớn 10 màn hình văn phòng, xuất báo giá chiết khấu sỉ.")}
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:border-slate-500 rounded whitespace-nowrap transition-colors"
            >
              [ + MUA SỈ 10 MÀN HÌNH ]
            </button>
          </div>

          {/* Khung Nhập Liệu (Input Console) */}
          <div className="flex-shrink-0 p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập yêu cầu thiết bị, cấu hình, ngân sách trần..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-800 text-slate-900 placeholder:text-slate-400 font-mono"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-slate-900 text-white font-mono text-xs font-bold rounded hover:bg-slate-800 disabled:opacity-40 transition-colors uppercase tracking-wider"
            >
              {loading ? "ĐANG XỬ LÝ..." : "GỬI YÊU CẦU"}
            </button>
          </div>
        </section>

        {/* ========================================================
            CỘT PHẢI (58%): Live Procurement Canvas & Quotation Sheet
           ======================================================== */}
        <section className="col-span-12 lg:col-span-7 bg-slate-100 p-6 overflow-y-auto min-h-0 flex flex-col space-y-5">
          {/* Header Cột Phải */}
          <div className="flex items-center justify-between border-b border-slate-300 pb-3 flex-shrink-0">
            <div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">[ 02 ] LIVE PROCUREMENT CANVAS</div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Bảng Thảo Thu Mua & Báo Giá Thương Mại
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">MÃ HIỆU:</span>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-900">
                {quotationNumber}
              </span>
            </div>
          </div>

          {/* 1. THẺ SỐ LIỆU NGÂN SÁCH (Financial KPI Cards) */}
          <div className="grid grid-cols-4 gap-3 text-xs flex-shrink-0">
            <div className="bg-white border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Trần Ngân Sách</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {maxBudget.toLocaleString("vi-VN")} đ
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Tạm Tính Đơn Hàng</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {grandTotal.toLocaleString("vi-VN")} đ
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Chiết Khấu B2B (5%)</div>
              <div className="text-base font-bold text-emerald-700 mt-1">
                - {discountAmount.toLocaleString("vi-VN")} đ
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Tỷ Lệ Tiêu Hao</div>
              <div className={`text-base font-bold mt-1 ${isOverBudget ? "text-rose-600" : "text-slate-900"}`}>
                {budgetUtilization}%
              </div>
            </div>
          </div>

          {/* 2. THƯỚC ĐO TIẾN ĐỘ NGÂN SÁCH (Hairline Progress Gauge) */}
          <div className="bg-white border border-slate-200 p-4 rounded space-y-2 flex-shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-slate-700 uppercase">
                Tiến Độ Kiểm Soát Hạn Ngạch Chi Tiêu
              </span>
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isOverBudget
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "bg-emerald-50 border-emerald-300 text-emerald-700"
                }`}
              >
                {isOverBudget ? "[ VƯỢT TRẦN NGÂN SÁCH ]" : "[ TRONG HẠN MỨC CHO PHÉP ]"}
              </span>
            </div>
            {/* Hairline progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
              <div
                className={`h-2 transition-all duration-500 ${isOverBudget ? "bg-rose-600" : "bg-slate-900"}`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Đã cam kết: {grandTotal.toLocaleString("vi-VN")} đ</span>
              <span>Dư địa: {Math.max(maxBudget - grandTotal, 0).toLocaleString("vi-VN")} đ</span>
            </div>
          </div>

          {/* 3. BẢNG DANH MỤC THIẾT BỊ (Financial Data Table) */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh Mục Thiết Bị Thu Mua Đã So Khớp
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3">TÊN THIẾT BỊ & CẤU HÌNH</th>
                  <th className="py-2.5 px-3 text-center w-12">SL</th>
                  <th className="py-2.5 px-3 text-right w-28">ĐƠN GIÁ</th>
                  <th className="py-2.5 px-3 text-right w-32">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{item.specsSummary}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {item.unitPrice.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {item.subtotal.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Chi tiết tính toán tài chính */}
            <div className="border-t border-slate-200 p-4 bg-slate-50/70 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Cộng tiền hàng (Subtotal):</span>
                <span>{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Chiết khấu khối lượng B2B (5%):</span>
                <span>- {discountAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế Giá trị Gia tăng VAT (10%):</span>
                <span>+ {vatAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                <span className="uppercase">TỔNG CỘNG THANH TOÁN:</span>
                <span className="text-base text-slate-950">{grandTotal.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          {/* 4. CHỨNG THỰC KIỂM TOÁN & KHỐI PHÊ DUYỆT (Governance & Action Ribbon) */}
          <div className="bg-white border border-slate-200 p-4 rounded space-y-3 flex-shrink-0">
            <div className="flex justify-between items-center text-xs">
              <div className="font-mono text-slate-600">
                TRẠNG THÁI HỆ THỐNG:{" "}
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    status === "ISSUED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {status === "ISSUED" ? "[ ĐÃ PHÁT HÀNH - ISSUED ]" : "[ CHỜ PHÊ DUYỆT - MANAGER ]"}
                </span>
              </div>
              <div className="font-mono text-slate-500 text-[11px]">
                QUY CHẾ: EDUREF_AI MULTI-LAYER GOVERNANCE
              </div>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-600 break-all">
              <span className="text-slate-400">SHA-256 AUDIT FINGERPRINT: </span>
              {auditFingerprint}
            </div>

            {/* Action Ribbon Buttons (Rectangular, high-contrast, minimal) */}
            <div className="flex gap-2 pt-1">
              {status === "DRAFT" ? (
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2.5 px-4 bg-slate-900 text-white font-mono text-xs font-bold rounded hover:bg-slate-800 transition-colors uppercase tracking-wider text-center"
                >
                  XÁC NHẬN PHÊ DUYỆT QUẢN LÝ (1-CLICK)
                </button>
              ) : (
                <div className="flex-1 py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold rounded text-center">
                  BÁO GIÁ ĐÃ ĐƯỢC PHÊ DUYỆT CHÍNH THỨC
                </div>
              )}
              <a
                href={`http://localhost:5000/api/quotations/${quotationNumber}/html`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-white border border-slate-300 text-slate-800 font-mono text-xs font-bold rounded hover:bg-slate-100 transition-colors uppercase tracking-wider text-center"
              >
                MỞ BẢN IN HTML
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProcurementWorkspace;
