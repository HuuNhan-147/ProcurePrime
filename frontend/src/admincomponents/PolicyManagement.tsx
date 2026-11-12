import { tx, uiMessage, uiText, useLocale, locale, formatVND, localizedNode } from "../i18n";
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
    type: uiMessage("policies:softwareServices"),
    badge: uiMessage("policies:saasEnterprise"),
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "tenant_steelcorp",
    name: "SteelCorp Heavy Industries",
    type: uiMessage("policies:equipmentDistribution"),
    badge: uiMessage("policies:heavyIndustry"),
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "default_tenant",
    name: "ProcurePrime Chuẩn Doanh Nghiệp",
    type: uiMessage("policies:systemDefault"),
    badge: uiMessage("policies:standardBase"),
    color: "from-slate-700 to-slate-900",
  },
];

// Danh mục các trường dữ liệu B2B hỗ trợ trong Condition Builder
const AVAILABLE_FIELDS = [
  { id: "totalAmount", label: uiMessage("policies:totalOrderValueVnd"), unit: "₫" },
  { id: "discountPercent", label: uiMessage("policies:discountRate"), unit: "%" },
  { id: "quoteValidityDays", label: uiMessage("policies:quotationValidityDays"), unit: uiMessage("policies:days") },
  { id: "quantity", label: uiMessage("policies:deviceQuantity"), unit: uiMessage("policies:units") },
];

const AVAILABLE_OPERATORS = [
  { id: ">=", label: uiMessage("policies:greaterThanOrEqualTo") },
  { id: "<=", label: uiMessage("policies:lessThanOrEqualTo") },
  { id: ">", label: uiMessage("policies:greaterThan") },
  { id: "<", label: uiMessage("policies:lessThan") },
  { id: "==", label: uiMessage("policies:equalTo") },
];

const AVAILABLE_ACTIONS = [
  { id: "REQUIRE_APPROVAL", label: uiMessage("policies:requireAdditionalApprovalApprovalGate") },
  { id: "REQUIRE_3_BIDS", label: uiMessage("policies:requireThreeCompetingQuotationsRuleOf3") },
  { id: "TAG_CAPEX", label: uiMessage("policies:tagAsFixedAssetDepreciationCapex") },
  { id: "AUTO_APPROVE", label: uiMessage("policies:allowAutomaticQuotationIssueAutoApprove") },
  { id: "HARD_REJECT", label: uiMessage("policies:blockAndRejectTheOrderHardStop") },
];

const AVAILABLE_TARGETS = [
  { id: "LINE_MANAGER", label: uiMessage("policies:salesLineManager") },
  { id: "PROCUREMENT_DIRECTOR", label: uiMessage("policies:procurementDirector") },
  { id: "CFO", label: uiMessage("policies:chiefFinancialOfficerCfo") },
  { id: "ASSET_ADMIN", label: uiMessage("policies:assetManagementAccounting") },
];

export const PolicyManagement: React.FC = () => {
  useLocale();
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
      toast.error(localizedNode("policies:unableToConnectToThePolicyServer"));
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
    toast.info(localizedNode("policies:adminWorkspaceChangedValue", { v0: (ENTERPRISE_TENANTS.find((t) => t.id === tenantId)?.name) }));
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
      toast.error(err.response?.data?.message || localizedNode("policies:unableToRunSimulation"));
    } finally {
      setSimulating(false);
    }
  };

  // Lưu cấu hình chính sách lên Server
  const handleSavePolicy = async () => {
    if (!changeReason.trim() || changeReason.trim().length < 5) {
      toast.warn(localizedNode("policies:enterAReasonForThePolicyChange"));
      return;
    }

    if (managerLimit <= autoLimit) {
      toast.error(localizedNode("policies:theManagerApprovalLimitMustExceedThe"));
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
        toast.success(localizedNode("policies:policyUpdatedSuccessfullyNewVersionVvalue", { v0: (res.data.data.version) }));
        setVersion(res.data.data.version);
        setAuditHistory(res.data.data.auditHistory || []);
        setChangeReason("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || localizedNode("policies:unableToUpdatePolicy"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-[#536171]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">{tx("policies:loadingGovernanceConfiguration")}</p>
      </div>
    );
  }

  const currentTenantObj = ENTERPRISE_TENANTS.find((t) => t.id === selectedTenant) || ENTERPRISE_TENANTS[0];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & MULTI-TENANT SWITCHER */}
      <div className="bg-white border border-[#d5dadc] rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/10 text-[#536171] rounded-lg border border-indigo-500/20">
                <ShieldCheck size={24} />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-[#142333] tracking-tight flex items-center gap-2">{tx("policies:noCodeGovernanceAiAgentStudio")}<span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-[#536171] font-mono border border-indigo-500/30">
                    v{uiText(version)}
                  </span>
                </h1>
                <p className="text-xs text-[#536171]">{tx("policies:configureApprovalAuthorityDiscountPermissionsAndAi")}</p>
              </div>
            </div>
          </div>

          {/* Tenant Selector Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2 rounded-lg border border-[#d5dadc]">
            <span className="text-xs font-semibold text-[#536171] px-2 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#536171]" />{tx("policies:organisation")}</span>
            <div className="flex flex-wrap gap-1.5">
              {ENTERPRISE_TENANTS.map((tenant) => (
                <button type="button"
                  key={tenant.id}
                  onClick={() => handleTenantChange(tenant.id)}
                  className={` px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedTenant === tenant.id
                      ? "bg-[#254AD7] text-[#142333] ring-1 ring-indigo-400/50"
                      : "text-[#536171] hover:text-[#142333] hover:bg-white"
                  }  `}
                >
                  <span>{uiText(tenant.name)}</span>
                  <span
                    className={` text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      selectedTenant === tenant.id ? "bg-white/20 text-white" : "bg-white text-[#536171]"
                    }  `}
                  >
                    {uiText(tenant.badge)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin Tenant đang chọn */}
        <div className="mt-4 pt-4 border-t border-[#d5dadc] flex flex-wrap items-center justify-between text-xs text-[#536171] gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[#142333] font-medium">{tx("policies:editing")}{" "}{uiText(currentTenantObj.name)}</span>
            <span>•</span>
            <span className="text-[#536171]">{uiText(currentTenantObj.type)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#536171]">
              <Info size={14} />{" "}{tx("policies:configurationBeingViewed")}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#536171]">{tx("policies:initialValuesDoNotConfirmThatA")}</p>
      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#d5dadc] pb-2">
        <button type="button"
          onClick={() => setActiveTab("visual_rules")}
          className={` px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "visual_rules"
              ? "bg-[#254AD7] text-[#142333]"
              : "text-[#536171] hover:text-[#142333] hover:bg-white"
          }  `}
        >
          <Zap size={16} />{tx("policies:visualRuleBuilderMideskIfThenModel")}<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">{uiText(rules.length)}</span>
        </button>

        <button type="button"
          onClick={() => setActiveTab("decision_table")}
          className={` px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "decision_table"
              ? "bg-[#254AD7] text-[#142333]"
              : "text-[#536171] hover:text-[#142333] hover:bg-white"
          }  `}
        >
          <Layers size={16} />{tx("policies:tieredDecisionTable")}</button>

        <button type="button"
          onClick={() => setActiveTab("pricing_terms")}
          className={` px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "pricing_terms"
              ? "bg-[#254AD7] text-[#142333]"
              : "text-[#536171] hover:text-[#142333] hover:bg-white"
          }  `}
        >
          <Scale size={16} />{tx("policies:discountLimitsQuotationValidity")}</button>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}

      {/* TAB A: VISUAL RULE BUILDER (KẾ THỪA MIDESK AUTOMATIONS/RULES) */}
      {activeTab === "visual_rules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#d5dadc]">
            <div>
              <h3 className="text-sm font-bold text-[#142333] flex items-center gap-2">
                <Zap size={16} className="text-amber-700" />{tx("policies:independentRulesFor")}{" "}{uiText(currentTenantObj.name)}
              </h3>
              <p className="text-xs text-[#536171] mt-0.5">{tx("policies:basedOnAConditionActionEngineDefine")}</p>
            </div>
            <button type="button"
              onClick={handleAddRule}
              className="px-3.5 py-2 bg-[#254AD7] hover:bg-indigo-500 text-[#142333] text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus size={15} />{" "}{tx("policies:addRule")}</button>
          </div>

          {rules.length === 0 ? (
            <div className="bg-white border border-[#d5dadc] rounded-lg p-8 text-center text-[#536171]">
              <Zap size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-[#536171]">{tx("policies:noDynamicRulesForThisOrganisation")}</p>
              <p className="text-xs text-slate-500 mt-1">{tx("policies:theSystemWillUseTheStandardTiered")}</p>
              <button type="button"
                onClick={handleAddRule}
                className="mt-4 px-4 py-2 bg-white hover:bg-[#254AD7] text-[#142333] text-xs font-bold rounded-lg transition"
              >{tx("policies:addTheFirstRule")}</button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, ruleIdx) => (
                <div
                  key={rule.id}
                  className="bg-white border border-[#d5dadc] rounded-lg p-5 space-y-4 transition-all hover:border-[#d5dadc]"
                >
                  {/* Header của Rule */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d5dadc]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-[#536171] text-xs font-bold flex items-center justify-center font-mono">
                        {uiText(ruleIdx + 1)}
                      </span>
                      <input aria-label={tx("policies:enabled")}
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                        className="bg-white border border-[#d5dadc] rounded-lg px-3 py-1.5 text-sm font-bold text-[#142333] focus:outline-none focus:border-indigo-500 min-w-[280px]"
                        placeholder={tx("policies:enterRuleName")}
                      />
                      <label className="flex items-center gap-2 text-xs text-[#536171] cursor-pointer ml-2">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={(e) => handleUpdateRule(rule.id, { isActive: e.target.checked })}
                          className="rounded bg-white border-[#d5dadc] text-[#254AD7] focus:ring-0"
                        />
                        <span>{tx("policies:enabled")}</span>
                      </label>
                    </div>

                    <button aria-label={tx("policies:deleteThisRule")} type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition self-end sm:self-auto"
                      title={tx("policies:deleteThisRule")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* KHỐI IF - CONDITIONS */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">{tx("policies:ifConditions")}</span>
                        <div className="flex items-center gap-3 text-xs text-[#536171]">
                          <span>{tx("policies:match")}</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[#536171]">
                            <input
                              type="radio"
                              name={`matchType_${rule.id}`}
                              value="ALL"
                              checked={rule.matchType === "ALL"}
                              onChange={() => handleUpdateRule(rule.id, { matchType: "ALL" })}
                              className="text-[#254AD7] focus:ring-0"
                            />
                            <span>{tx("policies:allConditionsAnd")}</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[#536171]">
                            <input
                              type="radio"
                              name={`matchType_${rule.id}`}
                              value="ANY"
                              checked={rule.matchType === "ANY"}
                              onChange={() => handleUpdateRule(rule.id, { matchType: "ANY" })}
                              className="text-[#254AD7] focus:ring-0"
                            />
                            <span>{tx("policies:anyConditionOr")}</span>
                          </label>
                        </div>
                      </div>

                      <button type="button"
                        onClick={() => handleAddCondition(rule.id)}
                        className="text-xs text-[#536171] hover:text-[#536171] font-semibold flex items-center gap-1"
                      >
                        <Plus size={14} />{" "}{tx("policies:addCondition")}</button>
                    </div>

                    {/* Danh sách các dòng điều kiện */}
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-[#d5dadc]">
                      {rule.conditions.map((cond, cIdx) => (
                        <div key={cIdx} className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="text-slate-500 font-mono w-4">{uiText(cIdx + 1)}.</span>

                          {/* Chọn trường */}
                          <select aria-label={tx("policies:conditionField")}
                            value={cond.field}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { field: e.target.value })}
                            className="bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-[#536171] focus:outline-none focus:border-indigo-500"
                          >
                            {AVAILABLE_FIELDS.map((f) => (
                              <option key={f.id} value={f.id}>
                                {uiText(f.label)}
                              </option>
                            ))}
                          </select>

                          {/* Chọn toán tử */}
                          <select aria-label={tx("policies:conditionOperator")}
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { operator: e.target.value })}
                            className="bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-[#536171] focus:outline-none focus:border-indigo-500 font-mono"
                          >
                            {AVAILABLE_OPERATORS.map((op) => (
                              <option key={op.id} value={op.id}>
                                {uiText(op.label)}
                              </option>
                            ))}
                          </select>

                          {/* Nhập giá trị */}
                          <input aria-label={tx("policies:conditionValue")}
                            type="number"
                            value={cond.value}
                            onChange={(e) => handleUpdateCondition(rule.id, cIdx, { value: Number(e.target.value) })}
                            className="bg-white border border-[#d5dadc] rounded-lg px-3 py-1.5 text-[#142333] font-mono focus:outline-none focus:border-indigo-500 w-32"
                          />

                          {/* Xóa dòng điều kiện */}
                          {rule.conditions.length > 1 && (
                            <button aria-label={tx("policies:deleteThisCondition")} type="button"
                              onClick={() => handleDeleteCondition(rule.id, cIdx)}
                              className="text-slate-500 hover:text-rose-700 p-1"
                              title={tx("policies:deleteThisCondition")}
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
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider">{tx("policies:thenSystemActions")}</span>

                      <button type="button"
                        onClick={() => handleAddAction(rule.id)}
                        className="text-xs text-emerald-700 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <Plus size={14} />{" "}{tx("policies:addAction")}</button>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-lg border border-[#d5dadc]">
                      {rule.actions.map((act, aIdx) => (
                        <div key={aIdx} className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="text-slate-500 font-mono w-4">⚡</span>

                          {/* Loại hành động */}
                          <select aria-label={tx("policies:actionType")}
                            value={act.actionType}
                            onChange={(e) => handleUpdateAction(rule.id, aIdx, { actionType: e.target.value })}
                            className="bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-[#536171] focus:outline-none focus:border-emerald-500 font-medium"
                          >
                            {AVAILABLE_ACTIONS.map((ac) => (
                              <option key={ac.id} value={ac.id}>
                                {uiText(ac.label)}
                              </option>
                            ))}
                          </select>

                          {/* Cấp phê duyệt mục tiêu */}
                          {act.actionType === "REQUIRE_APPROVAL" && (
                            <select aria-label={tx("policies:approvalAuthority")}
                              value={act.target || "LINE_MANAGER"}
                              onChange={(e) => handleUpdateAction(rule.id, aIdx, { target: e.target.value })}
                              className="bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-[#536171] focus:outline-none focus:border-emerald-500 font-medium"
                            >
                              {AVAILABLE_TARGETS.map((tg) => (
                                <option key={tg.id} value={tg.id}>
                                  {uiText(tg.label)}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Thông điệp / Hướng dẫn */}
                          <input aria-label={tx("policies:notesRoutingReason")}
                            type="text"
                            value={act.message || ""}
                            onChange={(e) => handleUpdateAction(rule.id, aIdx, { message: e.target.value })}
                            placeholder={tx("policies:notesRoutingReason")}
                            className="bg-white border border-[#d5dadc] rounded-lg px-3 py-1.5 text-[#536171] focus:outline-none focus:border-emerald-500 flex-1 min-w-[200px]"
                          />

                          {/* Xóa Action */}
                          {rule.actions.length > 1 && (
                            <button aria-label={tx("policies:deleteThisAction")} type="button"
                              onClick={() => handleDeleteAction(rule.id, aIdx)}
                              className="text-slate-500 hover:text-rose-700 p-1"
                              title={tx("policies:deleteThisAction")}
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
        <div className="bg-white border border-[#d5dadc] rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#142333] flex items-center gap-2">
                <Layers className="text-[#536171]" size={18} />{tx("policies:approvalAuthorityDecisionTable3TierMatrix")}</h2>
              <p className="text-xs text-[#536171] mt-1">{tx("policies:orderThresholdsDetermineWhetherTheAiMay")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1 */}
            <div className="bg-white rounded-lg border border-emerald-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{tx("policies:tier1AutomaticApprovalNoTouch")}</span>
                <span className="text-xs font-mono text-emerald-700">AUTO_APPROVED</span>
              </div>
              <p className="text-xs text-[#536171] mb-4">{tx("policies:ordersBelowThisThresholdAreIssuedAs")}</p>
              <div>
                <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:maximumLimitVnd")}</label>
                <input aria-label={tx("policies:maximumLimitVnd2")}
                  type="number"
                  value={autoLimit}
                  onChange={(e) => setAutoLimit(Number(e.target.value))}
                  className="w-full bg-white border border-[#d5dadc] rounded-lg px-3 py-2 text-[#142333] font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-emerald-700/80 mt-1 block font-mono">
                  ≤ {formatVND(autoLimit)}
                </span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-white rounded-lg border border-amber-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{tx("policies:tier2ManagerApproval")}</span>
                <span className="text-xs font-mono text-amber-700">MANAGER_APPROVAL</span>
              </div>
              <p className="text-xs text-[#536171] mb-4">{tx("policies:ordersInThisRangeRemainDraftsDraft")}</p>
              <div>
                <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:upperThresholdVnd")}</label>
                <input aria-label={tx("policies:upperThresholdVnd2")}
                  type="number"
                  value={managerLimit}
                  onChange={(e) => setManagerLimit(Number(e.target.value))}
                  className="w-full bg-white border border-[#d5dadc] rounded-lg px-3 py-2 text-[#142333] font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-amber-700/80 mt-1 block font-mono">
                  &gt; {uiText(autoLimit.toLocaleString(locale()))}{" "}{tx("policies:upTo")}{" "}{formatVND(managerLimit)}
                </span>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-white rounded-lg border border-rose-500/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">{tx("policies:tier3CfoBoard")}</span>
                <span className="text-xs font-mono text-rose-700">CFO_APPROVAL</span>
              </div>
              <p className="text-xs text-[#536171] mb-4">{tx("policies:ordersAboveTheStandardLimitRequireApproval")}</p>
              <div className="pt-2">
                <span className="text-[11px] text-[#536171] block mb-1">{tx("policies:activationRange")}</span>
                <div className="bg-white border border-[#d5dadc] rounded-lg p-2.5 text-center">
                  <span className="text-sm font-mono font-bold text-rose-700">
                    &gt; {formatVND(managerLimit)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block text-center">{tx("policies:annualBudgetReviewRequired")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: PRICING TERMS & DISCOUNT MATRICES */}
      {activeTab === "pricing_terms" && (
        <div className="bg-white border border-[#d5dadc] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#142333] flex items-center gap-2">
              <DollarSign className="text-[#536171]" size={18} />{tx("policies:wholesaleDiscountQuotationValidityPolicy")}</h2>
            <p className="text-xs text-[#536171] mt-1">{tx("policies:controlDiscountLimitsToProtectMarginAnd")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-[#d5dadc] p-4">
              <label className="text-xs font-semibold text-[#536171] block mb-1">{tx("policies:maximumDiscountRate")}</label>
              <input aria-label={tx("policies:maximumDiscountRate2")}
                type="number"
                value={wholesalePercent}
                onChange={(e) => setWholesalePercent(Number(e.target.value))}
                className="w-full bg-white border border-[#d5dadc] rounded-lg px-3 py-2 text-[#142333] font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">{tx("policies:salesDiscretionaryDiscount")}</span>
            </div>

            <div className="bg-white rounded-lg border border-[#d5dadc] p-4">
              <label className="text-xs font-semibold text-[#536171] block mb-1">{tx("policies:quotationValidityDays2")}</label>
              <input aria-label={tx("policies:quotationValidityDays")}
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full bg-white border border-[#d5dadc] rounded-lg px-3 py-2 text-[#142333] font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">{tx("policies:pricesMustBeRecalculatedOnExpiry")}</span>
            </div>

            <div className="bg-white rounded-lg border border-[#d5dadc] p-4">
              <label className="text-xs font-semibold text-[#536171] block mb-1">{tx("policies:standardVatRate")}</label>
              <input aria-label={tx("policies:standardVatRate2")}
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(Number(e.target.value))}
                className="w-full bg-white border border-[#d5dadc] rounded-lg px-3 py-2 text-[#142333] font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">{tx("policies:default10UnderTaxRules")}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. POLICY SIMULATOR SANDBOX (THỬ NGHIỆM TRỰC QUAN KHÔNG GHI DB) */}
      <div className="bg-white border border-indigo-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 text-[#536171] rounded-lg border border-indigo-500/30">
              <Play size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#142333] flex items-center gap-2">{tx("policies:policySimulatorSandbox")}</h3>
              <p className="text-xs text-[#536171]">{tx("policies:testAProcurementRequestAgainstThePolicy")}{" "}{uiText(currentTenantObj.name)}
              </p>
            </div>
          </div>

          <button type="button"
            onClick={handleSimulate}
            disabled={simulating}
            className="px-4 py-2 bg-[#254AD7] hover:bg-indigo-500 text-[#142333] text-xs font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {simulating ? <RotateCcw className="animate-spin" size={14} /> : <Play size={14} />}{tx("policies:runSimulation")}</button>
        </div>

        {/* Inputs Simulator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-[#d5dadc] mb-4">
          <div>
            <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:orderValueVnd")}</label>
            <input aria-label={tx("policies:orderValueVnd2")}
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-full bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-xs text-[#142333] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:requestedSalesDiscount")}</label>
            <input aria-label={tx("policies:requestedSalesDiscount2")}
              type="number"
              value={simDiscount}
              onChange={(e) => setSimDiscount(Number(e.target.value))}
              className="w-full bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-xs text-[#142333] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:requestedPriceValidityDays")}</label>
            <input aria-label={tx("policies:requestedPriceValidityDays2")}
              type="number"
              value={simValidity}
              onChange={(e) => setSimValidity(Number(e.target.value))}
              className="w-full bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-xs text-[#142333] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#536171] block mb-1">{tx("policies:departmentBudgetVnd")}</label>
            <input aria-label={tx("policies:departmentBudgetVnd2")}
              type="number"
              value={simBudget}
              onChange={(e) => setSimBudget(Number(e.target.value))}
              className="w-full bg-white border border-[#d5dadc] rounded-lg px-2.5 py-1.5 text-xs text-[#142333] font-mono"
            />
          </div>
        </div>

        {/* Output Simulator */}
        {simResult && (
          <div className="bg-white rounded-lg border border-indigo-500/30 p-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#d5dadc]">
              <span className="text-xs font-bold text-[#142333] flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#536171]" />{tx("policies:policyEngineAssessment")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-[#536171] border border-indigo-500/30">
                  {uiText(simResult.decision)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-white text-[#536171]">{tx("policies:authority")}{" "}{uiText(simResult.authorityLevel)}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#536171] leading-relaxed">{uiText(simResult.reason)}</p>
          </div>
        )}
      </div>

      {/* 5. AUDIT HISTORY & SAVE BAR */}
      <div className="bg-white border border-[#d5dadc] rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#142333] flex items-center gap-2">
            <Clock size={16} className="text-[#536171]" />{tx("policies:auditTrailPolicyActivation")}</h3>
          <p className="text-xs text-[#536171] mt-0.5">{tx("policies:everyPolicyChangeRequiresAReasonFor")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input aria-label={tx("policies:enterAReasonForChangingThePolicy")}
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder={tx("policies:enterAReasonForChangingThePolicy")}
            className="flex-1 w-full bg-white border border-[#d5dadc] rounded-lg px-4 py-2.5 text-xs text-[#142333] focus:outline-none focus:border-indigo-500"
          />

          <button type="button"
            onClick={handleSavePolicy}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#254AD7] hover:bg-indigo-500 text-[#142333] text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RotateCcw className="animate-spin" size={14} /> : <Save size={14} />}{tx("policies:saveActivateFor")}{" "}{uiText(currentTenantObj.badge)}
          </button>
        </div>

        {/* Audit History Log */}
        {auditHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#d5dadc]">
            <h4 className="text-xs font-bold text-[#536171] uppercase tracking-wider mb-2">{tx("policies:recentChanges")}</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {auditHistory.slice(0, 5).map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-[#d5dadc]">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-[#536171]" />
                    <span className="font-semibold text-[#536171]">{uiText(log.updatedBy)}</span>
                    <span className="text-[#536171]">: {uiText(log.changeReason)}</span>
                  </div>
                  <span className="text-slate-500 font-mono">{uiText(new Date(log.updatedAt).toLocaleString(locale()))}</span>
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
