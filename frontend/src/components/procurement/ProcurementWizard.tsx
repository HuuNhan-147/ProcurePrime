import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../../i18n";
// frontend/src/components/procurement/ProcurementWizard.tsx
// ==============================================================================
// ⚡ PROCUREMENT AUTOMATION WIZARD — Form Thu Mua B2B Tự Động Hóa Thông Minh
// Thay thế việc gõ prompt thủ công bằng Form điều khiển có cấu trúc (Combobox, Action)
// ==============================================================================

import React, { useState } from "react";
import {
  FaBolt,
  FaLaptop,
  FaMemory,
  FaCoins,
  FaBuilding,
  FaCheck,
  FaUndo,
  FaSlidersH,
} from "react-icons/fa";

interface ProcurementWizardProps {
  onSubmit: (compiledPrompt: string) => void;
  onCancel?: () => void;
}

// Các mẫu thu mua nhanh phổ biến trong doanh nghiệp
const PRESETS = [
  {
    id: "preset_onboarding",
    label: uiMessage("workspace:equip5NewTeamMembers"),
    deviceType: "Laptop văn phòng",
    quantity: 5,
    minRam: "16GB",
    accessories: ["Chuột không dây", "Bàn phím văn phòng"],
    budget: 90000000,
    department: "Kỹ thuật / IT",
    companyName: "Công ty TNHH AI Solutions",
  },
  {
    id: "preset_dev",
    label: uiMessage("workspace:upgradeEngineeringDevices3Units"),
    deviceType: "Laptop kỹ thuật hiệu năng cao",
    quantity: 3,
    minRam: "32GB",
    accessories: ["Chuột không dây", "Màn hình ngoài 24 inch", "Hub Type-C"],
    budget: 85000000,
    department: "R&D Software",
    companyName: "Công ty Cổ phần Công nghệ TechCorp",
  },
  {
    id: "preset_office",
    label: uiMessage("workspace:departmentEquipmentBundle10Units"),
    deviceType: "PC đồng bộ văn phòng",
    quantity: 10,
    minRam: "16GB",
    accessories: ["Chuột không dây", "Bàn phím văn phòng", "Màn hình ngoài 24 inch"],
    budget: 150000000,
    department: "Kinh doanh & Vận hành",
    companyName: "Công ty TNHH Phân Phối SteelCorp",
  },
];

const ACCESSORY_OPTIONS = [
  "Chuột không dây",
  "Bàn phím văn phòng",
  "Màn hình ngoài 24 inch",
  "Hub chuyển đổi Type-C",
  "Tai nghe chống ồn",
];

const accessoryLabels: Record<string, string> = {
  "Laptop văn phòng": "workspace:officeLaptop",
  "Chuột không dây": "workspace:wirelessMouse",
  "Bàn phím văn phòng": "workspace:officeKeyboard",
  "Kỹ thuật / IT": "workspace:engineeringIT",
  "Laptop kỹ thuật hiệu năng cao": "workspace:engineeringLaptop",
  "Màn hình ngoài 24 inch": "workspace:externalMonitor24",
  "Hub Type-C": "workspace:typeCHub",
  "R&D Software": "workspace:softwareRD",
  "PC đồng bộ văn phòng": "workspace:officeDesktop",
  "Kinh doanh & Vận hành": "workspace:salesOperations",
  "Hub chuyển đổi Type-C": "workspace:typeCAdapter",
  "Tai nghe chống ồn": "workspace:noiseCancellingHeadset"
};
const accessoryLabel = (value: string) => accessoryLabels[value] ? tx(accessoryLabels[value]) : value;

export const ProcurementWizard: React.FC<ProcurementWizardProps> = ({
  onSubmit,
  onCancel,
}) => {
  useLocale();
  const [department, setDepartment] = useState("Kỹ thuật / IT");
  const [deviceType, setDeviceType] = useState("Laptop văn phòng");
  const [quantity, setQuantity] = useState(5);
  const [minRam, setMinRam] = useState("16GB");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    "Chuột không dây",
    "Bàn phím văn phòng",
  ]);
  const [budget, setBudget] = useState(90000000);
  const [requireVat, setRequireVat] = useState(true);
  const [companyName, setCompanyName] = useState("Công ty TNHH AI Solutions");

  // Áp dụng Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDepartment(preset.department);
    setDeviceType(preset.deviceType);
    setQuantity(preset.quantity);
    setMinRam(preset.minRam);
    setSelectedAccessories([...preset.accessories]);
    setBudget(preset.budget);
    setCompanyName(preset.companyName);
  };

  // Toggle phụ kiện (mảng - array)
  const handleToggleAccessory = (item: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  // Compile Form State (hỗ trợ cả mảng accessories lẫn chuỗi string) thành Prompt chuẩn
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const accessoriesText =
      selectedAccessories.length > 0
        ? `kèm phụ kiện: ${selectedAccessories.join(", ")}`
        : "không lấy thêm phụ kiện ngoài";

    const vatText = requireVat
      ? `cần xuất hóa đơn VAT cho ${companyName.trim() || "Doanh nghiệp"}`
      : "chưa cần xuất hóa đơn VAT";

    const compiledPrompt = `Trang bị cho ${quantity} nhân sự thuộc phòng ban ${department}: ${quantity} ${deviceType} có RAM tối thiểu ${minRam}, ${accessoriesText}. Trần ngân sách tối đa ${budget.toLocaleString(
      "vi-VN"
    )} VNĐ, ${vatText}. Hãy tối ưu hóa cấu hình, gom giỏ hàng qua WebMCP và lập Báo giá Doanh nghiệp ngay lập tức!`;

    onSubmit(compiledPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
      {/* Header thanh gợi ý Preset */}
      <div>
        <label className="text-gray-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
          <FaSlidersH className="text-blue-600" /> {tx("workspace:quickProcurementTemplates")}</label>
        <div className="grid grid-cols-1 gap-1.5 mt-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.id)}
              className="text-left px-3 py-2 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-800 font-medium transition flex items-center justify-between group shadow-2xs"
            >
              <span className="font-medium text-xs group-hover:text-blue-700">{uiText(p.label)}</span>
              <span className="text-[11px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:border-blue-200">
                {uiText((p.budget / 1000000).toLocaleString(locale()))} Tr</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-3">
        {/* Hàng 1: Phòng ban & Thiết bị chính */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">{tx("workspace:receivingDepartment")}</label>
            <select
              aria-label={tx("workspace:receivingDepartment2")}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Kỹ thuật / IT">{tx("workspace:engineeringIt")}</option>
              <option value="Kinh doanh & Bán hàng">{tx("workspace:salesBusinessDevelopment")}</option>
              <option value="Hành chính Nhân sự">{tx("workspace:hrAdministration")}</option>
              <option value="Thiết kế & Marketing">{tx("workspace:designMarketing")}</option>
              <option value="Ban Giám Đốc">{tx("workspace:boardOfDirectors")}</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">{tx("workspace:deviceType")}</label>
            <select
              aria-label={tx("workspace:deviceType2")}
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Laptop văn phòng">{tx("workspace:officeLaptop")}</option>
              <option value="Laptop kỹ thuật hiệu năng cao">{tx("workspace:highPerformanceLaptop")}</option>
              <option value="PC đồng bộ văn phòng">{tx("workspace:officeDesktopPc")}</option>
              <option value="MacBook chuyên dụng">{tx("workspace:specialistMacbook")}</option>
            </select>
          </div>
        </div>

        {/* Hàng 2: Số lượng & RAM tối thiểu */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">{tx("workspace:deviceQuantity")}</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <button
                type="button"
                aria-label={tx("workspace:decreaseQuantity")}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 transition"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="100"
                aria-label={tx("workspace:deviceQuantity2")}
              value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center bg-transparent outline-none font-bold text-gray-800 py-1"
              />
              <button
                type="button"
                aria-label={tx("workspace:increaseQuantity")}
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 transition"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">{tx("workspace:minimumRam")}</label>
            <div className="grid grid-cols-3 gap-1">
              {["8GB", "16GB", "32GB"].map((ram) => (
                <button
                  key={ram}
                  type="button"
                  aria-pressed={minRam === ram}
                  onClick={() => setMinRam(ram)}
                  className={`py-2 rounded-lg font-bold border transition text-center ${
                    minRam === ram
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {uiText(ram)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hàng 3: Phụ kiện đính kèm (Mảng array multi-select) */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1.5">{tx("workspace:accessories")}{uiText(selectedAccessories.length)}{" "}{tx("workspace:selected")}</label>
          <div className="flex flex-wrap gap-1.5">
            {ACCESSORY_OPTIONS.map((acc) => {
              const active = selectedAccessories.includes(acc);
              return (
                <button
                  key={acc}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleToggleAccessory(acc)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                    active
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {active && <FaCheck className="text-[9px] text-emerald-600" />}
                  {accessoryLabel(acc)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hàng 4: Trần ngân sách */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-gray-700 flex items-center gap-1">
              <FaCoins className="text-amber-500" />{" "}{tx("workspace:maximumBudget")}</label>
            <span className="font-bold text-blue-700 text-xs">
              {formatVND(budget)}
            </span>
          </div>
          <input
            type="number"
            step="1000000"
            min="5000000"
            aria-label={tx("workspace:budgetLimitVnd")}
              value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[50000000, 90000000, 150000000, 250000000].map((bVal) => (
              <button
                key={bVal}
                type="button"
                onClick={() => setBudget(bVal)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                  budget === bVal
                    ? "bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-2xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {uiText((bVal / 1000000).toLocaleString(locale()))} Triệu
              </button>
            ))}
          </div>
        </div>

        {/* Hàng 5: Xuất hóa đơn VAT */}
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requireVat}
              onChange={(e) => setRequireVat(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-800">{tx("workspace:requireAVatInvoice10")}</span>
          </label>
          {requireVat && (
            <input
              type="text"
              aria-label={tx("workspace:invoicedLegalEntity")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={tx("workspace:enterCompanyInvoicedLegalEntityName")}
              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800 text-[11px] outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Nút Submit Kích Hoạt AI */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          <FaBolt className="text-amber-300 text-xs" />
          <span>{tx("workspace:sendRequestFromWizard")}</span>
        </button>
      </div>
    </form>
  );
};
