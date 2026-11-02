// modules/ai-agent/core/IntentRouter.js
// ============================================
// INTENT ROUTER — Bộ định tuyến ý định theo domain
// ============================================

export const DOMAIN_KEYWORDS = {
  CART: {
    keywords: [
      "giỏ hàng", "thêm vào giỏ", "add to cart", "remove from cart",
      "xóa khỏi giỏ", "cập nhật giỏ", "xem giỏ", "show cart",
      "thêm vào", "lấy con", "lấy cái", "thêm nó", "thêm cái này",
      "cập nhật số lượng", "cart", "bỏ vào giỏ", "cho vào giỏ",
      "báo giá", "b2b", "combo", "setup", "trang bị", "mua sỉ",
      "ngân sách", "doanh nghiệp", "quotation", "văn phòng", "cho nhân viên"
    ],
    weight: 10,
  },
  ORDER: {
    keywords: [
      "đơn hàng", "tạo đơn", "đặt hàng", "đặt mua", "order",
      "giao hàng", "địa chỉ giao", "theo dõi đơn", "trạng thái đơn",
      "hủy đơn", "cancel order", "xem đơn", "lịch sử mua",
      "đơn của tôi", "shipping", "vận chuyển", "mã đơn", "ordercode",
      "mua ngay", "checkout", "đặt ngay", "purchase order", "po",
      "xuất báo giá", "duyệt chi", "phê duyệt ngân sách", "hợp đồng"
    ],
    weight: 10,
  },
  PAYMENT: {
    keywords: [
      "thanh toán", "vnpay", "payment", "ngân hàng", "bank",
      "link thanh toán", "quét mã", "chuyển khoản", "atm",
      "momo", "ví điện tử", "trả tiền", "pay", "tạo link", "đặt cọc"
    ],
    weight: 10,
  },
  PROFILE: {
    keywords: [
      "tài khoản", "profile", "hồ sơ", "thông tin cá nhân",
      "cập nhật tên", "đổi số điện thoại", "đổi mật khẩu",
      "địa chỉ của tôi", "user info", "account", "thông tin của tôi",
      "cập nhật profile", "sửa thông tin",
      "cập nhật số", "cập nhật địa chỉ", "cập nhật email",
      "số điện thoại của tôi", "thay đổi mật khẩu", "đổi thông tin",
      "mã số thuế", "mst", "doanh nghiệp của tôi", "tên công ty"
    ],
    weight: 12,
  },
  PRODUCT: {
    keywords: [
      "tìm", "tìm kiếm", "search", "sản phẩm", "product",
      "có bán không", "giá bao nhiêu", "laptop", "máy tính",
      "thinkpad", "latitude", "optiplex", "workstation", "ultrasharp",
      "cisco", "synology", "nas", "switch", "laserjet", "máy in", "canon",
      "hội nghị", "webcam họp", "meetup", "mx keys", "jabra", "tai nghe call center",
      "macbook", "dell", "hp", "lenovo", "lg dualup", "màn hình", "phụ kiện văn phòng",
      "xem", "gợi ý", "recommend", "so sánh", "compare", "tốt nhất", "cấu hình",
      "trong tầm giá", "review", "đánh giá sản phẩm", "chuẩn doanh nghiệp"
    ],
    weight: 8,
  },
};

export const DOMAIN_TOOLS = {
  PRODUCT: ["search_products", "get_product_detail"],
  CART:    ["search_products", "add_to_cart", "bulk_add_to_cart", "add_from_last_viewed", "get_cart", "update_cart", "remove_from_cart", "get_cart_count", "evaluate_procurement_policy", "create_quotation"],
  ORDER:   ["get_cart", "create_order", "get_user_orders", "get_order_detail", "cancel_order", "evaluate_procurement_policy", "create_quotation"],
  PAYMENT: ["create_vnpay_payment", "get_order_detail"],
  PROFILE: ["get_user_profile", "update_user_profile"],
  GENERAL: ["search_products", "get_product_detail", "add_to_cart", "bulk_add_to_cart", "get_cart", "get_user_orders", "evaluate_procurement_policy", "create_quotation"],
};

export class IntentRouter {
  static detectIntent(message, history = []) {
    const normalizedMsg = message.toLowerCase().trim();

    const scores = {};
    for (const [domain, config] of Object.entries(DOMAIN_KEYWORDS)) {
      scores[domain] = 0;
      for (const kw of config.keywords) {
        if (normalizedMsg.includes(kw)) {
          scores[domain] += config.weight;
        }
      }
    }

    const recentHistory = history.filter((msg) => msg.role === "user").slice(-3);
    for (const msg of recentHistory) {
      const content = (msg.content || "").toLowerCase();
      for (const [domain, config] of Object.entries(DOMAIN_KEYWORDS)) {
        for (const kw of config.keywords) {
          if (content.includes(kw)) scores[domain] += Math.floor(config.weight / 3);
        }
      }
    }

    let bestDomain = "GENERAL";
    let bestScore = 0;

    for (const [domain, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    let activeDomains = [];
    if (bestScore >= 8) {
      for (const [domain, score] of Object.entries(scores)) {
        if (score >= 8 && score >= bestScore * 0.4) {
          activeDomains.push(domain);
        }
      }
    }

    if (activeDomains.length === 0) {
      // Chỉ kế thừa domain từ lịch sử nếu câu chat hiện tại có đại từ tham chiếu hoặc từ ngữ nối tiếp ngữ cảnh (hỗ trợ Unicode tiếng Việt)
      const hasFollowUpCue = /(^|\s|[.,?!])(nó|cái này|sản phẩm này|con này|món này|em này|cái đó|thứ|số|ở trên|vừa nãy|nữa|thế|như thế nào|bao nhiêu|màu gì|còn hàng)(\s|[.,?!]|$)/i.test(normalizedMsg);

      if (hasFollowUpCue) {
        for (let i = history.length - 1; i >= 0; i--) {
          const histMsg = (history[i].content || "").toLowerCase();
          let foundDomain = null;
          let histBestScore = 0;

          for (const [domain, config] of Object.entries(DOMAIN_KEYWORDS)) {
            let histScore = 0;
            for (const kw of config.keywords) {
              if (histMsg.includes(kw)) histScore += config.weight;
            }
            if (histScore > histBestScore && histScore >= 8) {
              histBestScore = histScore;
              foundDomain = domain;
            }
          }

          if (foundDomain) {
            activeDomains = [foundDomain];
            bestDomain = foundDomain;
            bestScore = histBestScore;
            break;
          }
        }
      }
    }

    if (activeDomains.length === 0) {
      activeDomains = ["GENERAL"];
      bestDomain = "GENERAL";
    }

    const toolSetSet = new Set();
    activeDomains.forEach((domain) => {
      const tools = DOMAIN_TOOLS[domain] || DOMAIN_TOOLS["GENERAL"];
      tools.forEach((t) => toolSetSet.add(t));
    });
    const toolSet = Array.from(toolSetSet);

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1).toFixed(2) : 0;

    return {
      domain: bestDomain,
      domains: activeDomains,
      confidence: parseFloat(confidence),
      score: bestScore,
      scores,
      toolSet,
    };
  }

  static filterToolDeclarations(toolNames, allDeclarations) {
    return allDeclarations.filter((decl) => toolNames.includes(decl.name));
  }
}

export const detectIntent = IntentRouter.detectIntent;
export const filterToolDeclarations = IntentRouter.filterToolDeclarations;
