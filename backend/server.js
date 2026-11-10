import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import routes from "./routes/index.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import cors from "cors";
import { runAgent } from "./modules/ai-agent/index.js"; // ✅ Import runAgent từ module AI Agent riêng biệt
import { validateEnv } from "./src/config/envValidator.js"; // ✅ Foundation: Thẩm định biến môi trường
import { logger } from "./src/shared/logger.js"; // ✅ Foundation: Structured Logger
import { errorHandler } from "./src/shared/middlewares/errorHandler.js"; // ✅ Foundation: Xử lý lỗi tập trung
import { AppError } from "./src/shared/errors/AppError.js";
import {
  securityHeaders,
  apiRateLimiter,
  authRateLimiter,
  aiAgentRateLimiter,
} from "./middleware/securityMiddleware.js";

dotenv.config();

// ✅ Thẩm định biến môi trường khi startup
const env = validateEnv();

const app = express();
app.disable("x-powered-by"); // Ẩn thông tin công nghệ máy chủ chống fingerprinting

const PORT = env.PORT;
const MONGO_URI = env.MONGO_URI;

// ✅ Khởi tạo HTTP Server & Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Một người dùng đã kết nối Socket.IO:", socket.id);

  // ✅ LẮNG NGHE SỰ KIỆN CHAT TỪ AI AGENT CLIENT HỖ TRỢ STREAMING
  socket.on("client_send_message", async (data) => {
    const { message, sessionId, userId, token, hasWebMCP } = data;
    console.log(`📡 Socket client_send_message received from ${socket.id}:`, {
      message: message?.substring(0, 50) + "...",
      sessionId: sessionId || "none",
      hasWebMCP: !!hasWebMCP,
    });

    try {
      const result = await runAgent(
        message,
        [], // context
        userId || null,
        token || null,
        sessionId || null,
        // Callback onChunk: phát chunk chữ thời gian thực về đúng client
        (chunkText, activeSessionId) => {
          socket.emit("agent_response_chunk", {
            text: chunkText,
            sessionId: activeSessionId,
          });
        },
        {
          clientSupportsWebMCP: !!hasWebMCP,
          socket,
        }
      );

      // Khi hoàn tất, phát toàn bộ dữ liệu metadata và payload sản phẩm
      socket.emit("agent_response_end", {
        success: result.success,
        reply: result.reply,
        sessionId: result.sessionId,
        payload: result.payload,
        requiresAuth: result.requiresAuth,
        hasPayload: result.hasPayload,
        productCount: result.productCount,
        _debug: result._debug,
      });

      console.log(`📡 Socket response end sent successfully to ${socket.id}`);
    } catch (error) {
      console.error(`❌ Socket AI Agent error for ${socket.id}:`, error);
      socket.emit("agent_response_end", {
        success: false,
        reply: "Ối, trợ lý ảo đang gặp sự cố nhỏ. Bạn thử lại nhé! 🙏",
        sessionId: sessionId || null,
        payload: null,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Người dùng đã thoát:", socket.id);
  });
});

// ✅ Middleware gán io chạy xuyên suốt app
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Security Headers chống Clickjacking, MIME-Sniffing & XSS
app.use(securityHeaders);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// ✅ Body-parser có giới hạn tải trọng an toàn
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ✅ Áp dụng Rate Limiting bảo vệ máy chủ
app.use("/api/users/login", authRateLimiter);
app.use("/api/users/register", authRateLimiter);
app.use("/api/ai-agent", aiAgentRateLimiter);
app.use("/api", apiRateLimiter);

// ✅ Định tuyến routes chính
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với API của tôi!");
});

// ✅ Kết nối Cơ sở dữ liệu & Khởi động Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Initialize Redis (if configured)
    connectRedis()
      .then(() => console.log("Redis initialized"))
      .catch((err) => console.warn("Redis not initialized:", err.message));

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO is ready!`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

// ✅ Middleware bắt route không tồn tại (404)
app.use((req, res, next) => {
  next(AppError.notFound(`Tài nguyên API không tồn tại: ${req.method} ${req.originalUrl}`));
});

// ✅ Middleware xử lý lỗi tập trung toàn cục
app.use(errorHandler);

// ✅ Graceful Shutdown
const handleShutdown = async () => {
  console.log("\n🛑 Đang đóng các kết nối và dừng máy chủ an toàn...");
  try {
    await disconnectRedis();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Lỗi khi tắt kết nối:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
