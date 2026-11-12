import { tx, uiMessage, uiText, useLocale } from "../i18n";
﻿import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategory } from "../api/CategoryApi";
import { ICategory } from "../types/category";
import { useAuth } from "../context/AuthContext";

import LandingRequestComposer from "./landing/LandingRequestComposer";
import { lazy, Suspense } from "react";
const IntelligenceFlowPreview = lazy(() => import("./landing/IntelligenceFlowPreview"));
import { ArrowRight, ArrowUpRight, Laptop, Monitor, Video, Printer, Network } from "lucide-react";
import { landingScene } from "./landing/landingScene";

// Cấu hình danh mục B2B tiêu biểu cho Interactive Matrix
const B2B_SOLUTIONS = [
  {
    name: "Máy Tính & Máy Trạm Doanh Nghiệp",
    shortTitle: uiMessage("marketing:computersWorkstations"),
    badge: uiMessage("marketing:coreHardware"),
    highlightDevice: "Dell Precision 3660 & ThinkPad T14",
    specs: "i7/i9 vPro • 32GB/64GB RAM • 1TB NVMe",
    warranty: "Bảo hành 36T On-site ProSupport",
    priceRange: "Từ 19.800.000 ₫",
  },
  {
    name: "Màn Hình & Hiển Thị Văn Phòng",
    shortTitle: uiMessage("marketing:professionalDisplays"),
    badge: uiMessage("marketing:visualWorkspace"),
    highlightDevice: "Dell UltraSharp U2724D & U3223QE",
    specs: "2K/4K IPS Black • 120Hz • Type-C 90W Hub",
    warranty: "Đổi mới tận nơi 36T",
    priceRange: "Từ 9.850.000 ₫",
  },
  {
    name: "Thiết Bị Hội Nghị & Ngoại Vi",
    shortTitle: uiMessage("marketing:meetingRoomsPeripherals"),
    badge: "Collaboration",
    highlightDevice: "Logitech MeetUp 4K & MX Keys S",
    specs: "Camera 4K 120° FOV • Micro AI • FIPS Bolt",
    warranty: "Chính hãng 24T",
    priceRange: "Từ 4.850.000 ₫",
  },
  {
    name: "Máy In & Thiết Bị Số Hóa",
    shortTitle: uiMessage("marketing:printersAdfScanners"),
    badge: uiMessage("marketing:documentFlow"),
    highlightDevice: "HP LaserJet Pro 4103fdw & Canon DR-C225",
    specs: "In 40 trang/phút • Quét 2 mặt Duplex tự động",
    warranty: "Bảo hành 36T tận nơi",
    priceRange: "Từ 8.950.000 ₫",
  },
  {
    name: "Hạ Tầng Mạng & Lưu Trữ Doanh Nghiệp",
    shortTitle: uiMessage("marketing:nasNetworkInfrastructure"),
    badge: "Infrastructure",
    highlightDevice: "Synology DS923+ & Cisco CBS250 PoE+",
    specs: "4 Khay HDD RAID • 24 Cổng Gigabit PoE+ 195W",
    warranty: "Limited Lifetime Cisco",
    priceRange: "Từ 15.400.000 ₫",
  },
];

const solutionIcons = [Laptop, Monitor, Video, Printer, Network];
const solutionDescriptions = [
  uiMessage("marketing:laptopsDesktopsAndWorkstationsForOfficeWork"),
  uiMessage("marketing:monitorsAndDisplaysForEverydayWorkAnd"),
  uiMessage("marketing:camerasConferencingDevicesAndPeripheralsForWorkplace"),
  uiMessage("marketing:printersAndScannersForTeamDocumentsRecords"),
  uiMessage("marketing:exploreNetworkAndStorageInfrastructureSuitedTo"),
];

const Banner: React.FC = () => {
  useLocale();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategory();
        setCategories(data);
      } catch (err) {
        console.warn("Không thể tải danh mục:", err);
      }
    };
    loadCategories();
  }, []);

  const currentSolution = B2B_SOLUTIONS[activeSolutionIndex];

  const handleFilterByCategory = () => {
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === currentSolution.name.toLowerCase()
    );
    if (matchedCategory) {
      navigate(`/products/search?category=${matchedCategory._id}&sortBy=latest`);
    } else {
      navigate("/products");
    }
  };

  const SolutionIcon = solutionIcons[activeSolutionIndex];

  return (
    <>
      <section className="pl-hero pl-wrap" aria-labelledby="pl-hero-title">
        <div className="pl-hero-heading">
          <p className="pl-eyebrow"><span className="pl-prime-mark" aria-hidden="true" />{tx("marketing:aiProcurementWithClarity")}</p>
          <h1 id="pl-hero-title" tabIndex={-1}>{tx("marketing:oneRequest")}<span>{tx("marketing:everyChoiceClear")}</span></h1>
        </div>
        <div className="pl-hero-body">
          <div className="pl-hero-entry">
            <p className="pl-hero-description">{tx("marketing:fromEquipmentRequirementsToOptionsAndQuotations")}</p>
            <LandingRequestComposer workspacePath={user?.isAdmin ? "/admin/workspace" : "/workspace"} />
            <div className="pl-hero-secondary">
              <button type="button" onClick={() => navigate("/products")} className="pl-text-link">{tx("marketing:exploreDevices")}{" "}<ArrowRight size={16} aria-hidden="true" /></button>
              <a href="#intelligence-flow" className="pl-text-link pl-text-link-muted">{tx("marketing:seeHowItWorks")}</a>
            </div>
          </div>
          <figure className="pl-device-scene">
            <div className="pl-device-frame">
              <picture>
                <source type="image/webp" srcSet={landingScene.srcSet} sizes={landingScene.sizes} />
                <img src={landingScene.src} width={1600} height={900} alt={tx("marketing:conceptImageOfAnUnbrandedLaptopMonitor")} fetchPriority="high" decoding="async" />
              </picture>
            </div>
            <figcaption>{tx("marketing:aiGeneratedConceptImageDoesNotRepresent")}</figcaption>
            <div className="pl-hero-trail" aria-label={tx("marketing:requirementsOptionsQuotation")}><span>{tx("marketing:requirements")}</span><ArrowRight size={16} aria-hidden="true" /><span>{tx("marketing:options")}</span><ArrowRight size={16} aria-hidden="true" /><span>{tx("marketing:quotation")}</span></div>
          </figure>
        </div>
      </section>
      <Suspense fallback={<section id="intelligence-flow" className="pl-wrap pl-flow-loading" role="status">{tx("common:screen.loading")}</section>}><IntelligenceFlowPreview /></Suspense>
      <section className="pl-solutions pl-wrap" aria-labelledby="pl-solutions-title">
        <div className="pl-section-heading">
          <div><p className="pl-eyebrow">{tx("marketing:devicesForTheWorkYouDo")}</p><h2 id="pl-solutions-title">{tx("marketing:everyTeam")}<br />{tx("marketing:aDifferentNeed")}</h2></div>
          <p>{tx("marketing:startWithTheRightDeviceCategoryThen")}</p>
        </div>
        <div className="pl-solutions-body">
          <div className="pl-solution-nav" role="group" aria-label={tx("marketing:chooseADeviceCategory")}>
            {B2B_SOLUTIONS.map((solution, index) => (
              <button key={solution.name} type="button" aria-pressed={activeSolutionIndex === index} onClick={() => setActiveSolutionIndex(index)}>
                <span>{uiText(solution.shortTitle)}</span><ArrowUpRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="pl-solution-detail">
            <SolutionIcon size={64} strokeWidth={1} aria-hidden="true" />
            <p className="pl-art-caption">{tx("marketing:currentDeviceCategory")}</p>
            <h3>{uiText(currentSolution.shortTitle)}</h3>
            <p>{uiText(solutionDescriptions[activeSolutionIndex])}</p>
            <button type="button" onClick={handleFilterByCategory} className="pl-text-link">{tx("marketing:browseThisDeviceCategory")}{" "}<ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="pl-solutions-links">
          <button type="button" onClick={() => navigate("/cart")} className="pl-text-link">{tx("marketing:openRfqCart")}{" "}<ArrowUpRight size={16} aria-hidden="true" /></button>
          {user?.isAdmin && <button type="button" onClick={() => navigate("/admin/workspace")} className="pl-text-link">{tx("marketing:openAiCopilotStaff")}{" "}<ArrowUpRight size={16} aria-hidden="true" /></button>}
        </div>
      </section>
    </>
  );
};

export default Banner;
