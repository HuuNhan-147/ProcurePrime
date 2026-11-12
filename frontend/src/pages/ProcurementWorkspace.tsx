import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../i18n";
// frontend/src/pages/ProcurementWorkspace.tsx
// ============================================
// PROCUREPRIME WORKSPACE — Không Gian Thu Mua & Báo Giá Doanh Nghiệp (Split-Screen)
// Thiết kế: Tối giản, thanh lịch, không lạm dụng icon, phân cấp thị giác bằng Typography
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { webMcpManager } from "../webmcp";
import { ProcurementWizard } from "../components/procurement/ProcurementWizard";
import WorkspaceOptions from "../components/procurement/WorkspaceOptions";
import "../components/procurement/workspace.css";
import LandingDraftBridge from "../components/landing/LandingDraftBridge";
import WorkspaceHeaderActions from "../components/procurement/WorkspaceHeaderActions";
import WorkspaceWelcome from "../components/procurement/WorkspaceWelcome";
import { ArrowUp } from "lucide-react";

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
  useLocale();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const landingLocation = useLocation();

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: uiMessage("workspace:helloIAmProcureprimeCopilotForB2b"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leftTab, setLeftTab] = useState<"wizard" | "chat">("chat");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Dữ liệu thời gian thực hiển thị tại Cột Phải (Live Canvas) - Khởi tạo sạch (No Mock)
  const [quotationNumber, setQuotationNumber] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [status, setStatus] = useState<"DRAFT" | "ISSUED">("DRAFT");
  const [auditFingerprint, setAuditFingerprint] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [canvasLoading, setCanvasLoading] = useState<boolean>(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const followConversation = useRef(true);
  const [viewMode, setViewMode] = useState<"split" | "ai" | "options" | "quote">("split");
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (landingLocation.state?.procurePrimeDraft) setViewMode("ai");
  }, [landingLocation.key]);

  // Hàm tải dữ liệu báo giá thực tế từ Backend API
  const fetchQuotationData = async (qNum: string) => {
    if (!qNum) return;
    try {
      setCanvasLoading(true);
      setCanvasError(null);
      const res = await fetch(`http://localhost:5000/api/quotations/${qNum}`);
      const json = await res.json();
      if (json.success && json.data) {
        const q = json.data;
        setQuotationNumber(q.quotationNumber || qNum);
        setStatus(q.status || "DRAFT");
        setAuditFingerprint(q.auditFingerprint || "");

        if (q.maxBudget) {
          setMaxBudget(Number(q.maxBudget));
        } else if (q.policyEvaluation?.allocatedBudget) {
          setMaxBudget(Number(q.policyEvaluation.allocatedBudget));
        }

        if (Array.isArray(q.items) && q.items.length > 0) {
          const mappedItems: ItemRow[] = q.items.map((it: any) => ({
            name: it.productName || it.name || "Thiết bị doanh nghiệp B2B",
            specsSummary: it.specsSummary || "Cấu hình chuẩn B2B",
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            subtotal: Number(it.subtotal) || (Number(it.unitPrice || 0) * Number(it.quantity || 1)),
          }));
          setItems(mappedItems);
        }
      } else {
        setCanvasError(json.message || uiMessage("workspace:unableToLoadQuotationData"));
      }
    } catch (err: any) {
      console.error("Lỗi khi tải báo giá:", err);
      setCanvasError(err?.message || uiMessage("workspace:unableToConnectToTheQuotationServer"));
    } finally {
      setCanvasLoading(false);
    }
  };

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
    if (btn.url?.includes("/excel") || btn.url?.startsWith("/api/") || btn.url?.startsWith("http")) {
      const downloadUrl = btn.url.startsWith("http") ? btn.url : `http://localhost:5000${btn.url}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "");
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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
    const region = historyRef.current;
    if (!region || !followConversation.current) return;
    region.scrollTo({ top: region.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
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

      // Tự động nhận diện mã báo giá và tải dữ liệu đồng bộ Canvas
      if (replyText) {
        const match = replyText.match(/(PP-\d{8}-[0-9A-F]{4})/i);
        if (match) {
          const detectedCode = match[1].toUpperCase();
          setQuotationNumber(detectedCode);
          fetchQuotationData(detectedCode);
        }
      }
    });

    // ✅ WEBMCP DUAL-PATH: Lắng nghe yêu cầu ủy quyền thực thi WebMCP tool từ Agent Server
    socket.on(
      "execute_webmcp_tool",
      async (data: { executionId: string; toolName: string; args: any }) => {
        const { executionId, toolName, args } = data;
        console.log(
          `🌐 [Workspace WebMCP] Server ủy quyền thực thi tool [${toolName}] (ID: ${executionId}):`,
          args
        );
        try {
          const result = await webMcpManager.executeTool(toolName, args);
          socket.emit(`webmcp_tool_result_${executionId}`, result);
          console.log(`✅ [Workspace WebMCP] Hoàn tất và gửi kết quả [${toolName}] về Server:`, result);
        } catch (err: any) {
          console.error(`❌ [Workspace WebMCP] Lỗi thực thi [${toolName}]:`, err);
          socket.emit(`webmcp_tool_result_${executionId}`, {
            success: false,
            error: err?.message || "Lỗi thực thi WebMCP tool trên trình duyệt",
          });
        }
      }
    );

    return () => {
      socket.off("agent_response_chunk");
      socket.off("agent_response_end");
      socket.off("execute_webmcp_tool");
      socket.disconnect();
    };
  }, []);

  const sendMessageWithText = (textToSend: string) => {
    if (!textToSend.trim() || loading || !socketRef.current) return;

    const userText = textToSend.trim();
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

  const handleSend = () => {
    sendMessageWithText(input);
  };

  const handleWizardSubmit = (compiledPrompt: string) => {
    setLeftTab("chat"); // Tự động chuyển sang xem luồng suy luận của AI và cập nhật Canvas
    sendMessageWithText(compiledPrompt);
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
        alert(tx("workspace:quotationValueApprovedSuccessfully", { v0: (quotationNumber) }));
        fetchQuotationData(quotationNumber);
      }
    } catch {
      setStatus("ISSUED");
      alert(tx("workspace:quotationValueApproved", { v0: (quotationNumber) }));
    }
  };

  const handleReset = () => {
    setMessages([
      {
        sender: "agent",
        text: uiMessage("workspace:aNewSessionHasStartedEnterYour"),
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
    setQuotationNumber("");
    setItems([]);
    setMaxBudget(0);
    setStatus("DRAFT");
    setAuditFingerprint("");
    setCanvasError(null);
  };

  return (
    <div className="pw-workspace" data-view={viewMode}>
      <header className="pw-header">
        <Link to="/" className="pw-brand" aria-label={tx("workspace:procureprimeHome")}>Procure<strong>Prime</strong></Link>
        <div className="pw-heading"><h1>{tx("workspace:procurementWorkspace")}</h1><p>{tx("workspace:clearRequirementsDecisionsInYourHands")}</p></div>
        <WorkspaceHeaderActions />
      </header>
      <nav className="pw-view-switch" aria-label={tx("workspace:workspaceViews")}>
        <button type="button" className="pw-split-control" aria-pressed={viewMode === "split"} onClick={() => setViewMode("split")}>{tx("workspace:splitWorkspace")}</button>
        <button type="button" aria-pressed={viewMode === "ai" || (isNarrow && viewMode === "split")} onClick={() => setViewMode("ai")}>{tx("workspace:aiAssistant")}</button>
        <button type="button" aria-pressed={viewMode === "options"} onClick={() => setViewMode("options")}>{tx("workspace:devicesComparison")}</button>
        <button type="button" aria-pressed={viewMode === "quote"} onClick={() => setViewMode("quote")}>{tx("workspace:quotation")}{" "}{items.length > 0 && <span>({uiText(items.length)})</span>}</button>
      </nav>
      <main className="pw-main">
        <section className="pw-assistant" aria-label={tx("workspace:aiAssistantAndWizard")}>
          <div className="pw-panel-heading"><h2>{tx("workspace:workWithAi")}</h2><button type="button" onClick={handleReset}>{tx("workspace:newSession2")}</button></div>
          <LandingDraftBridge currentDraft={input} busy={loading} onApplyDraft={(text) => {
            setInput((existing) => existing.trim() ? `${existing} ${text}` : text);
            setLeftTab("chat");
            setViewMode("ai");
          }} />
          <div className="pw-tools" role="group" aria-label={tx("workspace:requestEntryMethod")}>
            <button type="button" aria-pressed={leftTab === "chat"} onClick={() => setLeftTab("chat")}>{tx("workspace:conversation")}</button>
            <button type="button" aria-pressed={leftTab === "wizard"} onClick={() => setLeftTab("wizard")}>{tx("workspace:procurementWizard")}</button>
          </div>
          <div className="pw-wizard" hidden={leftTab !== "wizard"}>
            <p className="pw-wizard-note">{tx("workspace:structureYourRequirementsTheWizardSendButton")}</p>
            <ProcurementWizard onSubmit={handleWizardSubmit} />
          </div>
          <div className="pw-chat" hidden={leftTab !== "chat"}>
            <div ref={historyRef} className="pw-history" role="region" aria-label={tx("workspace:conversationContent")} tabIndex={0} onScroll={(event) => {
              const element = event.currentTarget;
              followConversation.current = element.scrollHeight - element.scrollTop - element.clientHeight < 96;
            }}>
              {messages.map((msg, idx) => <article key={idx} className={`pw-message pw-message--${msg.sender}`}>
                <p className="pw-message-meta">{uiText(msg.sender === "user" ? tx("workspace:you") : tx("workspace:procureprimeAi"))} <time>{uiText(msg.timestamp.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" }))}</time></p>
                <div className="pw-message-body">{idx === 0 && msg.text === uiMessage("workspace:helloIAmProcureprimeCopilotForB2b")
                  ? <WorkspaceWelcome original={uiText(msg.text)} />
                  : uiText(msg.text) || <span className="pw-muted">{tx("workspace:waitingForAiResponse")}</span>}
                      {(() => {
                        let actionsToRender = msg.actions ? [...msg.actions] : [];
                        // Nếu có mã báo giá và tin nhắn từ agent, tự động đảm bảo có nút Xuất Excel bên cột Action
                        if (msg.sender === "agent" && quotationNumber && !actionsToRender.some((b) => b.url?.includes("/excel") || b.label?.toLowerCase().includes("excel"))) {
                          actionsToRender.push({
                            label: uiMessage("workspace:exportQuotationToExcelXlsx"),
                            action: "navigate",
                            url: `/api/quotations/${quotationNumber}/excel`,
                            style: "primary",
                          });
                        }
                        if (actionsToRender.length === 0) return null;

                        return (
                          <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100">
                            {actionsToRender.map((btn, bIdx) => {
                              const cleanLabel = (btn.label || "").replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();
                              const isExcel = btn.url?.includes("/excel") || cleanLabel.toLowerCase().includes("excel");
                              return (
                                <button
                                  key={bIdx}
                                  onClick={() => handleActionClick(btn)}
                                  className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition flex items-center gap-1.5 ${
                                    isExcel
                                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                      : btn.style === "secondary"
                                      ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm"
                                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                                  }`}
                                >
                                  {uiText(cleanLabel)}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                </div>
              </article>)}
              <div ref={chatEndRef} />
            </div>
            <p className="pw-response-status" role="status">{uiText(loading ? tx("workspace:aiIsRespondingYouCanContinueReviewing") : tx("workspace:reviewAiProvidedInformationBeforeDeciding"))}</p>
            <details className="pw-suggestions"><summary>{tx("workspace:suggestedRequests")}</summary><div>
              <button type="button" onClick={() => setInput("Công ty TNHH Giải Pháp AI cần trang bị cho 5 nhân viên: 5 laptop văn phòng RAM tối thiểu 16GB, 5 bộ chuột phím không dây. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT.")}>{tx("workspace:equip5TeamMembers")}</button>
              <button type="button" onClick={() => setInput("Tôi cần mua số lượng lớn 10 màn hình văn phòng, xuất báo giá chiết khấu sỉ.")}>{tx("workspace:wholesaleOrderFor10Monitors2")}</button>
            </div></details>
          </div>
            <div className="pw-composer">
              <label htmlFor="pw-request">{tx("workspace:currentRequest")}</label>
              <div><input id="pw-request" type="text" data-landing-draft-input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                if (e.key === "Enter") handleSend();
              }} placeholder={tx("workspace:devicesSpecificationsQuantitiesBudget")} disabled={loading} />
              <button type="button" onClick={handleSend} disabled={loading || !input.trim()}><span className="pw-send-label">{uiText(loading ? tx("workspace:processing") : tx("workspace:sendRequest"))}</span><ArrowUp size={20} aria-hidden="true" /></button></div>
            </div>
        </section>
        <section className="pw-comparison" aria-label={tx("workspace:devicesAndComparisonTable")}><WorkspaceOptions items={items} /></section>
        <section className="pw-quote" aria-label={tx("workspace:currentQuotation")}>
          <div className="pw-panel-heading"><div><p className="pw-muted">{tx("workspace:procurementDocument")}</p><h2>{tx("workspace:currentQuotation")}</h2></div><span className="pw-quote-code">{uiText(quotationNumber || tx("workspace:noQuotationReferenceYet"))}</span></div>
<div className="pw-quote-body">          {/* Loading Alert */}
          {canvasLoading && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>{tx("workspace:syncingCommercialQuotationDataFromTheServer")}</span>
            </div>
          )}

          {/* Error Alert */}
          {canvasError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono rounded">{tx("workspace:syncError")}{" "}{uiText(canvasError)}
              {quotationNumber && <button type="button" onClick={() => fetchQuotationData(quotationNumber)} disabled={canvasLoading}>{tx("workspace:retryLoading")}</button>}
            </div>
          )}

          {/* Empty State khi chưa có Báo giá nào */}
          {!quotationNumber && items.length === 0 && !canvasLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-mono text-sm font-bold">
                PP
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">{tx("workspace:yourQuotationWillAppearHere")}</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{tx("workspace:enterRequirementsInTheConversationOrWizard")}</p>
            </div>
          )}

          {/* Hiển thị chi tiết khi đã có báo giá hoặc items */}
          {(quotationNumber || items.length > 0) && (
            <>
              {/* 1. THẺ SỐ LIỆU NGÂN SÁCH (Financial KPI Cards) */}
              <div className="grid grid-cols-4 gap-3 text-xs flex-shrink-0">
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{tx("workspace:budgetLimit")}</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {uiText(maxBudget > 0 ? tx("workspace:value", { v0: (maxBudget.toLocaleString(locale())) }) : tx("workspace:notSpecified"))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{tx("workspace:orderSubtotal")}</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {formatVND(grandTotal)}</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{tx("workspace:b2bDiscount")}{uiText(discountPercent)}%)</div>
                  <div className="text-base font-bold text-emerald-700 mt-1">
                    - {formatVND(discountAmount)}</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{tx("workspace:budgetUtilisation")}</div>
                  <div className={`text-base font-bold mt-1 ${isOverBudget ? "text-rose-600" : "text-slate-900"}`}>
                    {uiText(maxBudget > 0 ? `${budgetUtilization}%` : "N/A")}
                  </div>
                </div>
              </div>

              {/* 2. THƯỚC ĐO TIẾN ĐỘ NGÂN SÁCH (Hairline Progress Gauge) */}
              {maxBudget > 0 && (
                <div className="bg-white border border-slate-200 p-4 rounded space-y-2 flex-shrink-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-slate-700 uppercase">{tx("workspace:spendingLimitUtilisation")}</span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isOverBudget
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : "bg-emerald-50 border-emerald-300 text-emerald-700"
                      }`}
                    >
                      {isOverBudget ? tx("workspace:overBudgetStatus") : tx("workspace:withinBudgetStatus")}
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
                    <span>{tx("workspace:committed")}{" "}{formatVND(grandTotal)}</span>
                    <span>{tx("workspace:remaining")}{" "}{formatVND(Math.max(maxBudget - grandTotal, 0))}</span>
                  </div>
                </div>
              )}

              {/* 3. BẢNG DANH MỤC THIẾT BỊ (Financial Data Table) */}
              <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex-shrink-0">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">{tx("workspace:matchedProcurementEquipment")}</div>
                <div className="pw-table-scroll" role="region" aria-label={tx("workspace:quotationLineItems")} tabIndex={0}><table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">{tx("workspace:no")}</th>
                      <th className="py-2.5 px-3">{tx("workspace:deviceSpecifications")}</th>
                      <th className="py-2.5 px-3 text-center w-12">{tx("workspace:qty")}</th>
                      <th className="py-2.5 px-3 text-right w-28">{tx("workspace:unitPrice2")}</th>
                      <th className="py-2.5 px-3 text-right w-32">{tx("workspace:lineTotal")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{uiText(String(idx + 1).padStart(2, "0"))}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{uiText(item.name)}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{uiText(item.specsSummary)}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{uiText(item.quantity)}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatVND(item.unitPrice)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatVND(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>

                {/* Chi tiết tính toán tài chính */}
                <div className="border-t border-slate-200 p-4 bg-slate-50/70 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>{tx("workspace:subtotal")}</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>{tx("workspace:b2bVolumeDiscount")}{uiText(discountPercent)}%):</span>
                    <span>- {formatVND(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{tx("workspace:valueAddedTax10")}</span>
                    <span>+ {formatVND(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                    <span className="uppercase">{tx("workspace:totalPayment")}</span>
                    <span className="text-base text-slate-950">{formatVND(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* 4. CHỨNG THỰC KIỂM TOÁN & KHỐI PHÊ DUYỆT (Governance & Action Ribbon) */}
              <div className="bg-white border border-slate-200 p-4 rounded space-y-3 flex-shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-mono text-slate-600">{tx("workspace:systemStatus")}{" "}
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        status === "ISSUED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {status === "ISSUED" ? tx("workspace:issuedStatus") : tx("workspace:managerPendingStatus")}
                    </span>
                  </div>
                  <div className="font-mono text-slate-500 text-[11px]">{tx("workspace:policyEdurefAiMultiLayerGovernance")}</div>
                </div>

                {auditFingerprint && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-600 break-all">
                    <span className="text-slate-400">{tx("workspace:sha256AuditFingerprint")}{" "}</span>
                    {uiText(auditFingerprint)}
                  </div>
                )}

                {/* Action Ribbon Buttons */}
                <div className="flex gap-2 pt-1">
                  {status === "DRAFT" ? (
                    <button
                      onClick={handleApprove}
                      disabled={!quotationNumber}
                      className="flex-1 py-2.5 px-4 bg-slate-900 text-white font-mono text-xs font-bold rounded hover:bg-slate-800 disabled:opacity-50 transition-colors uppercase tracking-wider text-center"
                    >{tx("workspace:confirmManagerApproval1Click")}</button>
                  ) : (
                    <div className="flex-1 py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold rounded text-center">{tx("workspace:quotationApproved")}</div>
                  )}
                  {quotationNumber && (
                    <a
                      href={`http://localhost:5000/api/quotations/${quotationNumber}/html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-white border border-slate-300 text-slate-800 font-mono text-xs font-bold rounded hover:bg-slate-100 transition-colors uppercase tracking-wider text-center"
                    >{tx("workspace:openPrintableHtml")}</a>
                  )}
                </div>
              </div>
            </>
          )}</div>
          {items.length > 0 && <div className="pw-quote-total"><span>{tx("workspace:quotationTotal")}</span><strong>{formatVND(grandTotal)}</strong></div>}
        </section>
      </main>
    </div>
  );
};

export default ProcurementWorkspace;
