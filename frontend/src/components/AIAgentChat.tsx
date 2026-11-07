import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IProduct } from "../types/product";
import { io, Socket } from "socket.io-client"; // ✅ Tích hợp socket.io-client
import { webMcpManager } from "../webmcp"; // ✅ WebMCP runtime manager
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaTimes,
  FaShoppingCart,
  FaEye,
  FaRedo,
  FaStar,
  FaBox,
  FaArrowRight,
  FaMinus,
  FaFileInvoiceDollar,
  FaPrint,
  FaShieldAlt,
  FaUserCheck,
  FaBolt,
  FaComments,
} from "react-icons/fa";
import { QuotationModal } from "./procurement/QuotationModal";
import { ApprovalPanel } from "./procurement/ApprovalPanel";
import { BudgetProgressBar } from "./procurement/BudgetProgressBar";
import { ProcurementWizard } from "./procurement/ProcurementWizard";

// ✅ Interface cho Action Buttons
interface ActionButton {
  label: string;
  action: "navigate" | "cart" | "orders" | "profile";
  url?: string;
  style?: "primary" | "secondary";
}

interface Message {
  sender: "user" | "agent";
  text: string;
  products?: IProduct[];
  actions?: ActionButton[];
  timestamp?: Date;
}

const AIAgentChat: React.FC = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "wizard">("chat");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalQuotation, setApprovalQuotation] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null); // ✅ Lưu trữ tham chiếu Socket

  const handleOpenQuotation = (quotationNumber: string) => {
    setSelectedQuotation(quotationNumber);
    setIsQuotationModalOpen(true);
  };

  const handleOpenApproval = (quotationNumber: string) => {
    setApprovalQuotation(quotationNumber);
    setIsApprovalOpen(true);
  };

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && !isMinimized) {
      setMessages([
        {
          sender: "agent",
          text: "Kính chào Quý Doanh nghiệp! Tôi là ProcurePrime 💼 — Trợ lý AI Thu mua & Báo giá Tự hành thuộc đội ngũ AgentX Prime.\n\nTôi có thể hỗ trợ quý công ty:\n• Lên cấu hình thiết bị trọn gói theo phòng ban & số lượng nhân sự\n• Tối ưu danh mục theo ngân sách trần (Max Budget)\n• Tự động gom giỏ hàng B2B số lượng lớn (Zero-latency WebMCP)\n• Tự động xuất Báo giá Doanh nghiệp (Quotation / Commercial Invoice)\n\nAnh/chị có thể nhập trực tiếp nhu cầu mua sắm thiết bị để tôi phân tích ngay nhé!",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isMinimized]);

  // ✅ KẾT NỐI SOCKET.IO VÀ ĐĂNG KÝ LẮNG NGHE CHUNK CHỮ STREAM
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO from ProcurePrime Copilot!");
    });

    // Lắng nghe chunk chữ truyền về từ server thời gian thực
    socket.on("agent_response_chunk", (data: { text: string; sessionId: string }) => {
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === "agent") {
          // Nối thêm text chunk mới nhận được vào tin nhắn của agent
          const updatedLastMsg = {
            ...lastMsg,
            text: lastMsg.text + data.text,
          };
          return [...prev.slice(0, -1), updatedLastMsg];
        }
        return prev;
      });
    });

    // Lắng nghe khi cuộc hội thoại hoàn thành (kèm metadata sản phẩm và nút bấm)
    socket.on("agent_response_end", (data: any) => {
      console.log("📡 agent_response_end received:", data);
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === "agent") {
          const replyText = data.reply || lastMsg.text || "Tôi chưa hiểu rõ yêu cầu của bạn.";
          const { cleanText, actions } = parseActionsFromText(replyText);
          const transformedProducts = transformAgentProducts(data.payload?.products);

          const updatedLastMsg = {
            ...lastMsg,
            text: cleanText, // Làm sạch mã JSON của ACTIONS trong text hiển thị
            products: transformedProducts,
            actions: actions || undefined,
          };
          return [...prev.slice(0, -1), updatedLastMsg];
        }
        return prev;
      });

      setLoading(false);
    });

    // ✅ WEBMCP DUAL-PATH: Lắng nghe yêu cầu ủy quyền thực thi WebMCP tool từ Agent Server
    socket.on(
      "execute_webmcp_tool",
      async (data: { executionId: string; toolName: string; args: any }) => {
        const { executionId, toolName, args } = data;
        console.log(
          `🌐 [WebMCP] Server ủy quyền thực thi tool [${toolName}] (ID: ${executionId}):`,
          args
        );
        try {
          const result = await webMcpManager.executeTool(toolName, args);
          socket.emit(`webmcp_tool_result_${executionId}`, result);
          console.log(`✅ [WebMCP] Hoàn tất và gửi kết quả [${toolName}] về Server:`, result);
        } catch (err: any) {
          console.error(`❌ [WebMCP] Lỗi thực thi [${toolName}]:`, err);
          socket.emit(`webmcp_tool_result_${executionId}`, {
            success: false,
            error: err?.message || "Lỗi thực thi WebMCP tool trên trình duyệt",
          });
        }
      }
    );

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // ✅ HÀM TRANSFORM DATA từ agent format sang IProduct format
  const transformAgentProducts = (
    products: any[] | undefined | null
  ): IProduct[] => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    const filteredProducts = products.filter(
      (product) => product && (product.id || product._id) && product.name
    );

    const transformed = filteredProducts.map((product) => {
      const productId = product.id || product._id;

      return {
        _id: productId,
        name: product.name || "",
        price: Number(product.price) || 0,
        image: product.image || "/images/placeholder-product.jpg",
        category: product.category || product.brand || "uncategorized",
        rating: Number(product.rating) || 0,
        countInStock: Number(product.countInStock) || 0,
        description: product.description || "",
        numReviews: product.numReviews || 0,
        reviews: product.reviews || [],
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
        quantity: product.quantity || 0,
      };
    });

    return transformed;
  };

  // ✅ HÀM MỞ CHAT
  const handleOpenChat = () => {
    setIsMinimized(false);
  };

  // ✅ HÀM ĐÓNG CHAT (thu nhỏ)
  const handleMinimizeChat = () => {
    setIsMinimized(true);
  };

  // ✅ HÀM PARSE ACTIONS từ text
  const parseActionsFromText = (
    text: string
  ): { cleanText: string; actions: ActionButton[] | null } => {
    const actionsMatch = text.match(/\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/);

    if (!actionsMatch) {
      return { cleanText: text, actions: null };
    }

    try {
      const actionsJson = actionsMatch[1].trim();
      const actionsData = JSON.parse(actionsJson);
      const cleanText = text
        .replace(/\[ACTIONS\][\s\S]*?\[\/ACTIONS\]/, "")
        .trim();

      return {
        cleanText,
        actions: actionsData.buttons || null,
      };
    } catch (error) {
      console.error("Failed to parse actions:", error);
      return { cleanText: text, actions: null };
    }
  };

  // ✅ HÀM XỬ LÝ CLICK ACTION BUTTON
  const handleActionClick = (button: ActionButton) => {
    console.log("Action clicked:", button);

    switch (button.action) {
      case "cart":
        navigate("/cart");
        handleMinimizeChat();
        break;
      case "orders":
        navigate("/orders");
        handleMinimizeChat();
        break;
      case "profile":
        navigate("/profile");
        handleMinimizeChat();
        break;
      case "navigate":
        if (button.url) {
          if (button.url.includes("/excel") || button.url.startsWith("/api/")) {
            const downloadUrl = button.url.startsWith("http") ? button.url : `http://localhost:5000${button.url}`;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", "");
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            break;
          }
          if (/^https?:\/\//i.test(button.url)) {
            window.open(button.url, "_blank", "noopener,noreferrer");
          } else {
            navigate(button.url);
            handleMinimizeChat();
          }
        }
        break;
      default:
        console.warn("Unknown action:", button.action);
    }
  };

  // ✅ COMPONENT ACTION BUTTONS
  const ActionButtons: React.FC<{ actions: ActionButton[] }> = ({
    actions,
  }) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        {actions.map((button, index) => {
          const isPrimary = button.style === "primary" || index === 0;

          return (
            <button
              key={index}
              onClick={() => handleActionClick(button)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 shadow-sm hover:shadow-md
                ${
                  isPrimary
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {button.action === "cart" && <FaShoppingCart />}
              {button.action === "orders" && <FaBox />}
              {button.action === "profile" && <FaUser />}
              {button.action === "navigate" && <FaArrowRight />}
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const handleViewDetail = (product: IProduct) => {
    console.log("Xem chi tiết:", product);
    navigate(`/products/${product._id}`);
    handleMinimizeChat();
  };

  const handleNewChat = async () => {
    console.log("🆕 Starting new chat...");
    setMessages([
      {
        sender: "agent",
        text: "Xin chào! Tôi là ProcurePrime Copilot 🤖 — trợ lý thu mua và quản trị ngân sách doanh nghiệp. Hãy cho tôi biết nhu cầu trang thiết bị của công ty bạn nhé!",
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
    setInput("");
  };

  // Format agent text
  const formatAgentText = (text: string): React.ReactNode[] => {
    if (!text) return [];
    const lines = text.split("\n");
    const formattedLines: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      const processedLine = processLineWithHTMLAndMarkdown(line, lineIndex);
      if (processedLine) {
        formattedLines.push(processedLine);
      }
    });

    return formattedLines;
  };

  const processLineWithHTMLAndMarkdown = (
    line: string,
    lineIndex: number
  ): React.ReactNode => {
    if (!line.trim()) {
      return <div key={`line-${lineIndex}`} className="h-3" />;
    }

    if (line.includes("<br>•") || line.includes("<br>-")) {
      const listItems = line.split(/<br>•|<br>-/).filter((item) => item.trim());
      return (
        <div key={`line-${lineIndex}`} className="space-y-1">
          {listItems.map((item, itemIndex) => (
            <div
              key={`item-${lineIndex}-${itemIndex}`}
              className="flex items-start gap-3"
            >
              <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
              <span className="text-gray-700 text-sm flex-1">
                {processInlineFormatting(item.trim())}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (line.includes("<br>")) {
      const segments = line.split(/<br>/g);
      return (
        <div key={`line-${lineIndex}`} className="space-y-2">
          {segments.map((segment, segmentIndex) => (
            <div key={`segment-${lineIndex}-${segmentIndex}`}>
              {processInlineFormatting(segment)}
            </div>
          ))}
        </div>
      );
    }

    if (line.trim().startsWith("* ") && !line.includes("**")) {
      const content = line.trim().substring(2);
      return (
        <div key={`line-${lineIndex}`} className="flex items-start gap-3 my-1">
          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
          <span className="text-gray-700 text-sm flex-1">
            {processInlineFormatting(content)}
          </span>
        </div>
      );
    }

    return (
      <div key={`line-${lineIndex}`} className="my-1">
        {processInlineFormatting(line)}
      </div>
    );
  };

  const processInlineFormatting = (content: string): React.ReactNode => {
    if (!content) return null;
    const parts = content.split(/(<strong>.*?<\/strong>|\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
        const text = part.slice(8, -9);
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {text}
          </strong>
        );
      } else if (part.startsWith("**") && part.endsWith("**")) {
        const text = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {text}
          </strong>
        );
      } else {
        return (
          <span key={index} className="text-gray-700">
            {part}
          </span>
        );
      }
    });
  };

  // ✅ COMPONENT PRODUCT CARD
  const ProductCard: React.FC<{
    product: IProduct;
    onViewDetail: (product: IProduct) => void;
  }> = ({ product, onViewDetail }) => {
    const isValidProduct = product && product._id && product.name;

    if (!isValidProduct) {
      console.warn("Invalid product data:", product);
      return null;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200 mb-3 last:mb-0">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/80x80/EBF4FF/7F9CF5?text=📱";
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {product.category && product.category !== "uncategorized" && (
              <p className="text-xs font-medium text-blue-600 mb-1 capitalize">
                {product.category}
              </p>
            )}

            <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
              {product.name}
            </h4>

            {product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-xs ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.rating})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-red-600 font-bold text-sm">
                {product.price.toLocaleString("vi-VN")}₫
              </p>

              <div className="flex gap-1">
                <button
                  onClick={() => onViewDetail(product)}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                  title="Xem chi tiết"
                >
                  <FaEye className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ COMPONENT HIỂN THỊ MESSAGE
  const AgentMessageWithProducts: React.FC<{ message: Message }> = ({
    message,
  }) => {
    // Nếu tin nhắn đang rỗng (chờ stream chữ), hiển thị animation Đang soạn tin ngay tại đây
    if (!message.text && (!message.products || message.products.length === 0)) {
      return (
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm max-w-[320px]">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
            <span className="text-gray-500 text-xs italic">
              ProcurePrime đang phân tích & định giá...
            </span>
          </div>
        </div>
      );
    }

    const hasValidProducts =
      message.products &&
      message.products.length > 0 &&
      message.products.some(
        (product) => product && product._id && product.name
      );

    const validProducts =
      message.products?.filter(
        (product) => product && product._id && product.name
      ) || [];

    return (
      <div className="space-y-3">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm overflow-hidden w-full max-w-[340px]">
          <div className="px-4 py-3">
            <div className="text-gray-800 leading-relaxed text-sm space-y-2">
              {formatAgentText(message.text)}
            </div>

            {hasValidProducts && validProducts.length > 0 && (
              <div className="mt-3 space-y-2">
                {validProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            )}

            {/* Thẻ Báo Giá Thương Mại B2B Tự Động */}
            {(() => {
              const match = message.text.match(/(PP-\d{8}-[0-9A-F]{4})/i);
              if (!match) return null;
              const qNum = match[1].toUpperCase();
              return (
                <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-indigo-950">
                    <span className="flex items-center gap-1.5">
                      <FaFileInvoiceDollar className="text-indigo-600 text-sm" /> Báo Giá Thương Mại
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-indigo-300">
                      {qNum}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-normal">
                    Đã áp chiết khấu sỉ B2B 5%, thuế VAT 10% và gắn dấu băm kiểm toán SHA-256.
                  </p>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenQuotation(qNum)}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-xs" /> Xem Báo Giá
                    </button>
                    <button
                      onClick={() => handleOpenApproval(qNum)}
                      className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Phê duyệt thẩm quyền Manager/CFO"
                    >
                      <FaUserCheck className="text-xs" /> Phê Duyệt
                    </button>
                  </div>
                </div>
              );
            })()}

            {message.actions && <ActionButtons actions={message.actions} />}
          </div>

          {message.timestamp && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ GỬI TIN NHẮN TÙY CHỌN (HỖ TRỢ CẢ FORM WIZARD VÀ CHAT TRỰC TIẾP)
  const sendCustomMessage = (textToSend: string) => {
    if (!textToSend.trim() || loading || !socketRef.current) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    const agentMsg: Message = {
      sender: "agent",
      text: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setLoading(true);

    try {
      const token = getToken ? getToken() : null;

      socketRef.current.emit("client_send_message", {
        message: textToSend,
        sessionId,
        userId: user?.id || null,
        token,
        hasWebMCP: true,
      });

      console.log("📤 client_send_message emitted via Socket.io:", textToSend.slice(0, 60));
    } catch (err) {
      console.error("❌ Chat Socket emit error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "agent",
          text: "⚠️ Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    }
  };

  // ✅ XỬ LÝ SUBMIT TỪ FORM WIZARD TỰ ĐỘNG
  const handleWizardSubmit = (compiledPrompt: string) => {
    setActiveTab("chat");
    sendCustomMessage(compiledPrompt);
  };

  // ✅ HANDLE SEND MESSAGE VIA SOCKET.IO STREAM
  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    sendCustomMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ NẾU ĐANG THU NHỎ -> HIỂN THỊ NÚT MỞ CHAT
  if (isMinimized) {
    return (
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 z-50 hover:scale-110 group"
        title="Mở Trợ lý Thu mua B2B ProcurePrime"
      >
        <FaRobot className="text-2xl" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></span>

        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-gray-700">
          💼 Trợ lý Thu mua B2B • ProcurePrime
        </div>
      </button>
    );
  }

  // ✅ NẾU ĐANG MỞ -> HIỂN THỊ KHUNG CHAT ĐẦY ĐỦ
  return (
    <div className="fixed bottom-6 right-6 w-[420px] max-w-[95vw] h-[640px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <FaRobot className="text-xl text-blue-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-wide">ProcurePrime</h3>
              <span className="text-[9px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.5 rounded font-semibold uppercase">
                B2B Agent
              </span>
            </div>
            <p className="text-blue-200 text-xs">AgentX Prime • Thu mua Doanh nghiệp Tự hành</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="hover:bg-white/20 p-2 rounded-full transition"
            title="Phiên làm việc mới"
          >
            <FaRedo className="text-sm" />
          </button>
          <button
            onClick={handleMinimizeChat}
            className="hover:bg-white/20 p-2 rounded-full transition"
            title="Thu nhỏ"
          >
            <FaMinus className="text-sm" />
          </button>
          <button
            onClick={handleMinimizeChat}
            className="hover:bg-white/20 p-2 rounded-full transition"
            title="Đóng"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Tab Navigation: Trò Chuyện vs Form Thu Mua Nhanh (Smart Wizard) */}
      <div className="flex bg-slate-100 p-1 border-b border-gray-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === "chat"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FaComments className="text-xs text-blue-600" />
          <span>Trò Chuyện AI</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wizard")}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === "wizard"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FaBolt className={activeTab === "wizard" ? "text-amber-300 animate-pulse" : "text-amber-500"} />
          <span>⚡ Form Thu Mua Nhanh (Smart Wizard)</span>
        </button>
      </div>

      {/* Nội dung chính: Form Wizard hoặc Khung Chat */}
      {activeTab === "wizard" ? (
        <div className="flex-1 overflow-y-auto bg-white">
          <ProcurementWizard onSubmit={handleWizardSubmit} />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-blue-50/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.sender === "agent" && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaRobot className="text-white text-xs" />
                </div>
              )}
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaUser className="text-white text-xs" />
                </div>
              )}

              <div className="flex flex-col gap-1.5 max-w-[340px]">
                {msg.sender === "user" ? (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-none px-4 py-2.5 shadow-sm">
                    <div className="text-white leading-relaxed text-sm">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <AgentMessageWithProducts message={msg} />
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={chatEndRef}></div>
      </div>

      {/* Quick Prompts B2B */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() =>
            setInput(
              "Công ty tôi cần trang bị cho 5 nhân viên: 5 laptop văn phòng RAM tối thiểu 16GB, 5 bộ chuột phím không dây. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT cho Công ty TNHH Giải Pháp AI."
            )
          }
          className="text-[11px] whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full transition flex items-center gap-1 font-medium"
        >
          💼 5 Laptop + 5 Chuột (Ngân sách 90tr)
        </button>
        <button
          onClick={() =>
            setInput(
              "Tôi cần mua số lượng lớn 10 màn hình văn phòng cho dự án, có chính sách chiết khấu B2B không?"
            )
          }
          className="text-[11px] whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full transition flex items-center gap-1 font-medium"
        >
          🏢 Mua sỉ 10 màn hình có chiết khấu
        </button>
        <button
          onClick={() =>
            setInput(
              "Hãy xuất bản Báo giá Doanh nghiệp (Quotation) chi tiết cho các sản phẩm trong giỏ hàng."
            )
          }
          className="text-[11px] whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full transition flex items-center gap-1 font-medium"
        >
          📄 Xuất báo giá B2B & VAT
        </button>
      </div>

      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập nhu cầu thu mua doanh nghiệp, ngân sách..."
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <FaPaperPlane className={`text-sm ${loading ? "animate-pulse" : ""}`} />
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-1.5">
          ProcurePrime • Tối ưu Thu mua Doanh nghiệp với AI Tự hành & WebMCP 🚀
        </p>
      </div>
      </>
      )}

      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        quotationNumber={selectedQuotation}
      />

      <ApprovalPanel
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        quotationNumber={approvalQuotation}
        onApprovalSuccess={(qNum) => {
          setSelectedQuotation(qNum);
        }}
      />
    </div>
  );
};

export default AIAgentChat;
