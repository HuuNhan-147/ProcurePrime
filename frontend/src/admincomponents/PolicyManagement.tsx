import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  SlidersHorizontal,
  Play,
  RotateCcw,
  Save,
  Clock,
  User,
  FileCheck,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  Zap,
  Info,
  Scale,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Cấu trúc mô hình dữ liệu Rule Condition (Kế thừa Midesk)
interface RuleCondition {
  field: string;
  operator: string;
  value: any;
}

// Cấu trúc mô hình dữ liệu Rule Action (Kế thừa Midesk)
interface RuleAction {
  actionType: string;
  target?: string;
  message?: string;
}

// Cấu trúc một Dynamic Rule hoàn chỉnh
interface DynamicRule {
  id: string;
  name: string;
  description: string;
  matchType: "ALL" | "ANY";
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

interface Thresholds {
  autoApprovalLimit: number;
  managerApprovalLimit: number;
}

interface PricingRules {
  wholesaleThresholdQuantity: number;
  wholesaleThresholdSubtotal: number;
  wholesaleDiscountPercent: number;
  vatPercent: number;
  quotationValidityDays: number;
}

interface AuditItem {
  updatedBy: string;
  updatedAt: string;
  changeReason: string;
  diffSummary?: any;
}

interface PolicyData {
  _id?: string;
  tenantId: string;
  name: string;
  version: string;
  isActive: boolean;
  thresholds: Thresholds;
  pricingRules: PricingRules;
  rules?: DynamicRule[];
  auditHistory: AuditItem[];
}

// Danh sách các Tenant doanh nghiệp mẫu
const ENTERPRISE_TENANTS = [
  {
    id: "tenant_techcorp",
    name: "TechCorp Solutions (SaaS B2B)",
    type: "Phần Mềm / Dịch Vụ Công Nghệ",
    badge: "SaaS Enterprise",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "tenant_steelcorp",
    name: "SteelCorp Heavy Industries",
    type: "Phân Phối Vật Tư & Thiết Bị",
    badge: "Công Nghiệp Nặng",
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "default_tenant",
    name: "ProcurePrime Chuẩn Doanh Nghiệp",
    type: "Mặc Định Toàn Hệ Thống",
    badge: "Standard Base",
    color: "from-slate-700 to-slate-900",
  },
];

// Danh mục các trường dữ liệu B2B hỗ trợ trong Condition Builder
const AVAILABLE_FIELDS = [
  { id: "totalAmount", label: "Tổng giá trị đơn hàng (VNĐ)", unit: "₫" },
  { id: "discountPercent", label: "Tỷ lệ chiết khấu (%)", unit: "%" },
  { id: "quoteValidityDays", label: "Thời hạn hiệu lực báo giá (Ngày)", unit: "ngày" },
  { id: "quantity", label: "Số lượng thiết bị đặt mua", unit: "chiếc" },
];

const AVAILABLE_OPERATORS = [
  { id: ">=", label: "Lớn hơn hoặc bằng (>=)" },
  { id: "<=", label: "Nhỏ hơn hoặc bằng (<=)" },
  { id: ">", label: "Lớn hơn (>)" },
  { id: "<", label: "Nhỏ hơn (<)" },
  { id: "==", label: "Bằng đúng (==)" },
];

const AVAILABLE_ACTIONS = [
  { id: "REQUIRE_APPROVAL", label: "Yêu cầu cấp duyệt bổ sung (Approval Gate)" },
  { id: "REQUIRE_3_BIDS", label: "Bắt buộc 3 Báo giá cạnh tranh (Rule of 3 Bids)" },
  { id: "TAG_CAPEX", label: "Gán mã Tài sản Cố định & Khấu hao (CapEx)" },
  { id: "AUTO_APPROVE", label: "Cho phép tự động phát hành báo giá (Auto-Approve)" },
  { id: "HARD_REJECT", label: "Chặn đứng và từ chối đơn hàng (Hard Stop)" },
];

const AVAILABLE_TARGETS = [
  { id: "LINE_MANAGER", label: "Trưởng Phòng Kinh Doanh (Line Manager)" },
  { id: "PROCUREMENT_DIRECTOR", label: "Giám Đốc Thu Mua (Procurement Director)" },
  { id: "CFO", label: "Giám Đốc Tài Chính (CFO)" },
  { id: "ASSET_ADMIN", label: "Phòng Quản Trị Tài Sản & Kế Toán" },
];

export const PolicyManagement: React.FC = () => {
  const { token } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState("tenant_techcorp");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [autoLimit, setAutoLimit] = useState(60_000_000);
  const [managerLimit, setManagerLimit] = useState(250_000_000);
  const [wholesaleQty, setWholesaleQty] = useState(3);
  const [wholesaleSubtotal, setWholesaleSubtotal] = useState(40_000_000);
  const [wholesalePercent, setWholesalePercent] = useState(15);
  const [vatPercent, setVatPercent] = useState(10);
  const [validityDays, setValidityDays] = useState(30);
  const [rules, setRules] = useState<DynamicRule[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditItem[]>([]);
  const [changeReason, setChangeReason] = useState("");

  // Simulator states
  const [simAmount, setSimAmount] = useState<number>(45_000_000);
  const [simDiscount, setSimDiscount] = useState<number>(8);
  const [simValidity, setSimValidity] = useState<number>(15);
  const [simBudget, setSimBudget] = useState<number>(100_000_000);
  const [simQty, setSimQty] = useState<number>(10);
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // Tab điều hướng nội bộ trong trang
  const [activeTab, setActiveTab] = useState<"decision_table" | "visual_rules" | "pricing_terms">("visual_rules");

  // Tải chính sách theo Tenant từ Backend
  const loadPolicy = async (tenantId = selectedTenant) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/governance/policy?tenantId=${tenantId}`);
      if (res.data?.success && res.data?.data) {
        const p: PolicyData = res.data.data;
        setName(p.name || "Quy Chế Mua Sắm B2B Doanh Nghiệp");
        setVersion(p.version || "1.0.0");
        setAutoLimit(p.thresholds?.autoApprovalLimit ?? 50_000_000);
        setManagerLimit(p.thresholds?.managerApprovalLimit ?? 200_000_000);
        setWholesaleQty(p.pricingRules?.wholesaleThresholdQuantity ?? 5);
        setWholesaleSubtotal(p.pricingRules?.wholesaleThresholdSubtotal ?? 50_000_000);
        setWholesalePercent(p.pricingRules?.wholesaleDiscountPercent ?? 5);
        setVatPercent(p.pricingRules?.vatPercent ?? 10);
        setValidityDays(p.pricingRules?.quotationValidityDays ?? 15);
        setRules(p.rules || []);
        setAuditHistory(p.auditHistory || []);
        setSimResult(null); // Reset simulator
      }
    } catch (err: any) {
      console.error("Lỗi khi tải chính sách:", err);
      toast.error("Không thể kết nối đến máy chủ quy chế. Đang dùng cấu hình bộ nhớ đệm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy(selectedTenant);
  }, [selectedTenant]);

  // Xử lý chuyển đổi Tenant
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    toast.info(`Đã chuyển đổi không gian quản trị: ${ENTERPRISE_TENANTS.find((t) => t.id === tenantId)?.name}`);
  };

  // Thêm một Rule động mới (Kế thừa Midesk)
  const handleAddRule = () => {
    const newRule: DynamicRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Quy tắc bổ sung #${rules.length + 1}`,
      description: "Quy định điều kiện kiểm soát nghiệp vụ đặc thù",
      matchType: "ALL",
      isActive: true,
      conditions: [{ field: "discountPercent", operator: ">", value: 10 }],
      actions: [{ actionType: "REQUIRE_APPROVAL", target: "LINE_MANAGER", message: "Yêu cầu Trưởng phòng xem xét chiết khấu" }],
    };
    setRules([...rules, newRule]);
  };

  // Xóa một Rule
  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  // Cập nhật thuộc tính của một Rule
  const handleUpdateRule = (ruleId: string, updates: Partial<DynamicRule>) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  // Thêm Condition vào Rule
  const handleAddCondition = (ruleId: string) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          return {
            ...r,
            conditions: [...r.conditions, { field: "totalAmount", operator: ">=", value: 50_000_000 }],
          };
        }
        return r;
      })
    );
  };

  // Xóa Condition khỏi Rule
  const handleDeleteCondition = (ruleId: string, index: number) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          const newConds = [...r.conditions];
          newConds.splice(index, 1);
          return { ...r, conditions: newConds };
        }
        return r;
      })
    );
  };

  // Cập nhật Condition
  const handleUpdateCondition = (ruleId: string, index: number, updates: Partial<RuleCondition>) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          const newConds = [...r.conditions];
          newConds[index] = { ...newConds[index], ...updates };
          return { ...r, conditions: newConds };
        }
        return r;
      })
    );
  };

  // Thêm Action vào Rule
  const handleAddAction = (ruleId: string) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          return {
            ...r,
            actions: [...r.actions, { actionType: "REQUIRE_APPROVAL", target: "CFO", message: "Yêu cầu Giám đốc Tài chính phê duyệt" }],
          };
        }
        return r;
      })
    );
  };

  // Xóa Action khỏi Rule
  const handleDeleteAction = (ruleId: string, index: number) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          const newActions = [...r.actions];
          newActions.splice(index, 1);
          return { ...r, actions: newActions };
        }
        return r;
      })
    );
  };

  // Cập nhật Action
  const handleUpdateAction = (ruleId: string, index: number, updates: Partial<RuleAction>) => {
    setRules(
      rules.map((r) => {
        if (r.id === ruleId) {
          const newActions = [...r.actions];
          newActions[index] = { ...newActions[index], ...updates };
          return { ...r, actions: newActions };
        }
        return r;
      })
    );
  };

  // Chạy giả lập Sandbox Simulator
  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const res = await axios.post("http://localhost:5000/api/governance/simulate", {
        tenantId: selectedTenant,
        totalAmount: simAmount,
        maxBudget: simBudget > 0 ? simBudget : null,
        discountPercent: simDiscount,
        quoteValidityDays: simValidity,
        quantity: simQty,
        customPolicy: {
          thresholds: {
            autoApprovalLimit: autoLimit,
            managerApprovalLimit: managerLimit,
          },
          pricingRules: {
            wholesaleDiscountPercent: wholesalePercent,
            quotationValidityDays: validityDays,
            vatPercent,
          },
          rules,
        },
      });

      if (res.data?.success) {
        setSimResult(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể chạy mô phỏng");
    } finally {
      setSimulating(false);
    }
  };

  // Lưu cấu hình chính sách lên Server
  const handleSavePolicy = async () => {
    if (!changeReason.trim() || changeReason.trim().length < 5) {
      toast.warn("Vui lòng nhập lý do thay đổi quy chế (tối thiểu 5 ký tự) để lưu vết kiểm toán!");
      return;
    }

    if (managerLimit <= autoLimit) {
      toast.error("Hạn mức Trưởng phòng duyệt phải lớn hơn hạn mức tự động duyệt!");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        tenantId: selectedTenant,
        name,
        changeReason,
        thresholds: {
          autoApprovalLimit: autoLimit,
          managerApprovalLimit: managerLimit,
        },
        pricingRules: {
          wholesaleThresholdQuantity: wholesaleQty,
          wholesaleThresholdSubtotal: wholesaleSubtotal,
          wholesaleDiscountPercent: wholesalePercent,
          vatPercent,
          quotationValidityDays: validityDays,
        },
        rules,
      };

      const res = await axios.put("http://localhost:5000/api/governance/policy", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        toast.success(`Cập nhật quy chế thành công! Phiên bản mới: v${res.data.data.version}`);
        setVersion(res.data.data.version);
        setAuditHistory(res.data.data.auditHistory || []);
        setChangeReason("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể cập nhật quy chế");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Đang tải cấu hình quy chế quản trị...</p>
      </div>
    );
  }

  const currentTenantObj = ENTERPRISE_TENANTS.find((t) => t.id === selectedTenant) || ENTERPRISE_TENANTS[0];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & MULTI-TENANT SWITCHER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <ShieldCheck size={24} />
              </span>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  No-Code Governance &amp; AI Agent Studio
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    v{version}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Cấu hình phân quyền phê duyệt, thẩm quyền chiết khấu và luật nghiệp vụ AI theo từng Doanh nghiệp
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Selector Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
              <Building2 size={14} className="text-indigo-400" />
              Doanh Nghiệp:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ENTERPRISE_TENANTS.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantChange(tenant.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedTenant === tenant.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <span>{tenant.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      selectedTenant === tenant.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tenant.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin Tenant đang chọn */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Đang hiệu chỉnh: {currentTenantObj.name}</span>
            <span>•</span>
            <span className="text-slate-400">{currentTenantObj.type}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={14} /> Chính sách đang hoạt động (Hot-Reload)
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("visual_rules")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "visual_rules"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Zap size={16} />
          Visual Rule Builder (Mô hình IF-THEN Midesk)
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">{rules.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("decision_table")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "decision_table"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers size={16} />
          Bảng Quyết Định Phân Tầng (Decision Table)
        </button>

        <button
          onClick={() => setActiveTab("pricing_terms")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "pricing_terms"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Scale size={16} />
          Hạn Mức Chiết Khấu &amp; Hiệu Lực Báo Giá
        </button>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}

      {/* TAB A: VISUAL RULE BUILDER (KẾ THỪA MIDESK AUTOMATIONS/RULES) */}
      {activeTab === "visual_rules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Bộ Quy Tắc Động Độc Lập Cho {currentTenantObj.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Được kế thừa từ kiến trúc Condition-Action Engine: Cho phép thiết lập các luật IF (Điều kiện) THEN (Hành động) mà không cần lập trình lại AI
              </p>
            </div>
            <button
              onClick={handleAddRule}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Plus size={15} /> Thêm Quy Tắc Mới
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Zap size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">Chưa có quy tắc động nào cho doanh nghiệp này.</p>
              <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ áp dụng theo Bảng Quyết Định Phân Tầng tiêu chuẩn (Tier 1/2/3).</p>
              <button
                onClick={handleAddRule}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition"
              >
                + Thêm Quy Tắc Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, ruleIdx) => (
                <div
                  key={rule.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition-all hover:border-slate-700"
                >
                  {/* Header của Rule */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center font-mono">
                        {ruleIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                        className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 min-w-[280px]"
                        placeholder="Nhập tên quy tắc..."
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer ml-2">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={(e) => handleUpdateRule(rule.id, { isActive: e.target.checked })}
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <span>Đang kích hoạt</span>
                      </label>
                    </div>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition self-end sm:self-auto"
                      title="Xóa quy tắc này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* KHỐI IF - CONDITIONS */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
                          IF (NẾU)
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Khớp:</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name={`matchType_${rule.id}`}
                              value="ALL"
                              checked={rule.matchType === "ALL"}
                              onChange={() => handleUpdateRule(rule.id, { matchType: "ALL" })}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <span>Tất cả điều kiện (AND)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name={`matchType_${rule.id}`}
                              value="ANY"
                              checked={rule.matchType === "ANY"}
                              onChange={() => handleUpdateRule(rule.id, { matchType: "ANY" })}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <span>Một trong các điều kiện (OR)</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddCondition(rule.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <Plus size={14} /> Thêm điều kiện
                      </button>
                    </div>

                    {/* Danh sách các dòng điều kiện */}
                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {rule.conditions.map((cond, cIdx) => (
                        <div key={cIdx} className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="text-slate-500 font-mono w-4">{cIdx + 1}.</span>

                          {/* Chọn trường */}
                          <select
                            value={cond.field}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { field: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            {AVAILABLE_FIELDS.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label}
                              </option>
                            ))}
                          </select>

                          {/* Chọn toán tử */}
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { operator: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                          >
                            {AVAILABLE_OPERATORS.map((op) => (
                              <option key={op.id} value={op.id}>
                                {op.label}
                              </option>
                            ))}
                          </select>

                          {/* Nhập giá trị */}
                          <input
                            type="number"
                            value={cond.value}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { value: Number(e.target.value) })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500 w-32"
                          />

                          {/* Xóa dòng điều kiện */}
                          {rule.conditions.length > 1 && (
                            <button
                              onClick={() => handleDeleteCondition(rule.id, cIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Xóa điều kiện này"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KHỐI THEN - ACTIONS */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                        THEN (HÀNH ĐỘNG HỆ THỐNG)
                      </span>

                      <button
                        onClick={() => handleAddAction(rule.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <Plus size={14} /> Thêm hành động
                      </button>
                    </div>

                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {rule.actions.map((act, aIdx) => (
                        <div key={aIdx} className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="text-slate-500 font-mono w-4">⚡</span>

                          {/* Loại hành động */}
                          <select
                            value={act.actionType}
                            onChange={(e) => handleUpdateAction(rule.id, aIdx, { actionType: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          >
                            {AVAILABLE_ACTIONS.map((ac) => (
                              <option key={ac.id} value={ac.id}>
                                {ac.label}
                              </option>
                            ))}
                          </select>

                          {/* Cấp phê duyệt mục tiêu */}
                          {act.actionType === "REQUIRE_APPROVAL" && (
                            <select
                              value={act.target || "LINE_MANAGER"}
                              onChange={(e) => handleUpdateAction(rule.id, aIdx, { target: e.target.value })}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-indigo-300 focus:outline-none focus:border-emerald-500 font-medium"
                            >
                              {AVAILABLE_TARGETS.map((tg) => (
                                <option key={tg.id} value={tg.id}>
                                  {tg.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Thông điệp / Hướng dẫn */}
                          <input
                            type="text"
                            value={act.message || ""}
                            onChange={(e) => handleUpdateAction(rule.id, aIdx, { message: e.target.value })}
                            placeholder="Ghi chú / Lý do điều hướng..."
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500 flex-1 min-w-[200px]"
                          />

                          {/* Xóa Action */}
                          {rule.actions.length > 1 && (
                            <button
                              onClick={() => handleDeleteAction(rule.id, aIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Xóa hành động này"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: DECISION TABLE (TIERS) */}
      {activeTab === "decision_table" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="text-indigo-400" size={18} />
                Bảng Quyết Định Phân Tầng Thẩm Quyền (3-Tier Matrix)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ngưỡng giá trị đơn hàng quyết định xem AI được tự động duyệt báo giá hay phải chuyển tiếp cho nhân viên
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1 */}
            <div className="bg-slate-950/80 rounded-xl border border-emerald-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tầng 1: Tự Động Duyệt (No-Touch)
                </span>
                <span className="text-xs font-mono text-emerald-400">AUTO_APPROVED</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Đơn hàng dưới ngưỡng này sẽ được AI Agent tự động phát hành báo giá ngay lập tức.
              </p>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Hạn mức tối đa (₫):</label>
                <input
                  type="number"
                  value={autoLimit}
                  onChange={(e) => setAutoLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-emerald-400/80 mt-1 block font-mono">
                  ≤ {autoLimit.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-slate-950/80 rounded-xl border border-amber-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tầng 2: Trưởng Phòng Duyệt
                </span>
                <span className="text-xs font-mono text-amber-400">MANAGER_APPROVAL</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Đơn hàng trong khoảng này chuyển thành dự thảo (DRAFT) chờ Quản lý Mua sắm xét duyệt.
              </p>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ngưỡng chặn trên (₫):</label>
                <input
                  type="number"
                  value={managerLimit}
                  onChange={(e) => setManagerLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-amber-400/80 mt-1 block font-mono">
                  &gt; {autoLimit.toLocaleString("vi-VN")} ₫ đến ≤ {managerLimit.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-950/80 rounded-xl border border-rose-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Tầng 3: CFO / Ban Giám Đốc
                </span>
                <span className="text-xs font-mono text-rose-400">CFO_APPROVAL</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Đơn hàng vượt trần thông thường, bắt buộc phải có Giám đốc Tài chính phê duyệt.
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">Phạm vi kích hoạt:</span>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-center">
                  <span className="text-sm font-mono font-bold text-rose-400">
                    &gt; {managerLimit.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block text-center">Bắt buộc thẩm định ngân sách năm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: PRICING TERMS & DISCOUNT MATRICES */}
      {activeTab === "pricing_terms" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="text-indigo-400" size={18} />
              Quy Chế Chiết Khấu Sỉ &amp; Thời Hạn Hiệu Lực Báo Giá
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Kiểm soát trần chiết khấu để bảo vệ biên lợi nhuận, quy định thời hạn hiệu lực để tránh rủi ro tỷ giá
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tỷ lệ chiết khấu tối đa (%):</label>
              <input
                type="number"
                value={wholesalePercent}
                onChange={(e) => setWholesalePercent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Chiết khấu sales tự quyết định</span>
            </div>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Thời hạn hiệu lực báo giá (Ngày):</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Hết hạn bắt buộc tính lại giá</span>
            </div>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Thuế suất VAT tiêu chuẩn (%):</label>
              <input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Mặc định 10% theo quy định thuế</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. POLICY SIMULATOR SANDBOX (THỬ NGHIỆM TRỰC QUAN KHÔNG GHI DB) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Play size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Policy Simulator Sandbox (Mô Phỏng Thẩm Định AI)
              </h3>
              <p className="text-xs text-slate-400">
                Chạy thử nghiệm một yêu cầu mua sắm thực tế với chính sách của {currentTenantObj.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {simulating ? <RotateCcw className="animate-spin" size={14} /> : <Play size={14} />}
            Chạy Mô Phỏng
          </button>
        </div>

        {/* Inputs Simulator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Giá trị đơn hàng (₫):</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Chiết khấu sales xin (%):</label>
            <input
              type="number"
              value={simDiscount}
              onChange={(e) => setSimDiscount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Thời hạn xin giữ giá (Ngày):</label>
            <input
              type="number"
              value={simValidity}
              onChange={(e) => setSimValidity(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Ngân sách phòng ban (₫):</label>
            <input
              type="number"
              value={simBudget}
              onChange={(e) => setSimBudget(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Output Simulator */}
        {simResult && (
          <div className="bg-slate-950/80 rounded-xl border border-indigo-500/30 p-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-400" />
                Kết Quả Thẩm Định Bởi Policy Engine:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {simResult.decision}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                  Cấp: {simResult.authorityLevel}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{simResult.reason}</p>
          </div>
        )}
      </div>

      {/* 5. AUDIT HISTORY & SAVE BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            Lưu Vết Kiểm Toán &amp; Kích Hoạt Chính Sách
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mọi thay đổi chính sách đều bắt buộc phải nhập lý do nhằm phục vụ kiểm toán nội bộ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="Nhập lý do thay đổi quy chế (VD: Nâng hạn mức chiết khấu theo quyết định QĐ-2026/04)..."
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleSavePolicy}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RotateCcw className="animate-spin" size={14} /> : <Save size={14} />}
            Lưu &amp; Kích Hoạt Cho {currentTenantObj.badge}
          </button>
        </div>

        {/* Audit History Log */}
        {auditHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nhật Ký Thay Đổi Gần Nhất:</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {auditHistory.slice(0, 5).map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-indigo-400" />
                    <span className="font-semibold text-slate-200">{log.updatedBy}</span>
                    <span className="text-slate-400">: {log.changeReason}</span>
                  </div>
                  <span className="text-slate-500 font-mono">{new Date(log.updatedAt).toLocaleString("vi-VN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;
