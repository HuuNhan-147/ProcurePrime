import { tx, useLocale } from "../i18n";
import React from "react";
import { Link } from "react-router-dom";
import { FileText, Headphones, Layers, Monitor } from "lucide-react";
import ProcurePrimeWordmark from "./brand/ProcurePrimeWordmark";
import PrimeSurface from "./ui/PrimeSurface";

const Footer: React.FC = () => {
  useLocale();
  return (
    <footer className="pp-footer">
      <PrimeSurface variant="contrast" className="pp-footer__capabilities">
        <div className="pp-footer__container pp-footer__capability-list">
          <div><Monitor size={22} aria-hidden="true" /><p><strong>{tx("navigation:deviceCatalog")}</strong><span>{tx("navigation:optionsForBusinessNeeds")}</span></p></div>
          <div><FileText size={22} aria-hidden="true" /><p><strong>{tx("navigation:quotationsInOnePlace")}</strong><span>{tx("navigation:reviewDetailsInWorkspace")}</span></p></div>
          <div><Layers size={22} aria-hidden="true" /><p><strong>{tx("navigation:procurementContext")}</strong><span>{tx("navigation:reviewRequirementsAndBudgetTogether")}</span></p></div>
          <div><Headphones size={22} aria-hidden="true" /><p><strong>{tx("navigation:businessSupport")}</strong><span>{tx("navigation:b2bHotline19002154")}</span></p></div>
        </div>
      </PrimeSurface>
      <div className="pp-footer__container">
        <div className="pp-footer__main">
          <div className="pp-footer__about">
            <ProcurePrimeWordmark />
            <p>{tx("navigation:aWorkspaceForEnterpriseEquipmentProcurementExplore")}</p>
            <details className="pp-footer__company">
              <summary>{tx("navigation:businessInformation")}</summary>
              <div>
                <p><strong>{tx("navigation:legalEntity")}</strong> CÔNG TY CỔ PHẦN CÔNG NGHỆ PROCUREPRIME VIỆT NAM</p>
                <p><strong>{tx("navigation:businessRegistrationNumber")}</strong>{" "}{tx("navigation:0317892345IssuedByHoChiMinhCity")}</p>
                <p><strong>{tx("navigation:registeredOffice")}</strong> Tòa nhà Innovation Hub, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
              </div>
            </details>
          </div>
          <nav className="pp-footer__nav" aria-label={tx("navigation:equipmentSolutions")}>
            <h2>{tx("navigation:deviceCatalog")}</h2>
            <ul>
              <li><Link to="/products?category=workstation">{tx("navigation:enterpriseWorkstationsLaptopsVproEcc")}</Link></li>
              <li><Link to="/products?category=display">{tx("navigation:colourAccurateMonitors90WTypeC")}</Link></li>
              <li><Link to="/products?category=meeting">{tx("navigation:4kAiCameraMeetingRoomSolutionsLogitech")}</Link></li>
              <li><Link to="/products?category=network">{tx("navigation:nasRaidStorageCiscoNetworkSecurityEquipment")}</Link></li>
              <li><Link to="/products?category=printer">{tx("navigation:highSpeedPrintingDocumentDigitisation")}</Link></li>
            </ul>
          </nav>
          <nav className="pp-footer__nav" aria-label={tx("navigation:workspaceAndOperations")}>
            <h2>{tx("navigation:workspaceOperations")}</h2>
            <ul>
              <li><Link to="/workspace" className="pp-footer__workspace-link">{tx("navigation:procurementWorkspaceAi")}</Link></li>
              <li><a href="#compliance">{tx("navigation:budgetLimitReconciliationPolicy")}</a></li>
              <li><a href="#audit">{tx("navigation:sha256AuditFingerprintMechanism")}</a></li>
              <li><a href="#sla">{tx("navigation:onSiteDeliveryInstallationSla")}</a></li>
              <li><a href="#warranty">{tx("navigation:onSiteProsupportWarrantyPolicy")}</a></li>
            </ul>
          </nav>
        </div>
        <div className="pp-footer__bottom">
          <p>{tx("navigation:2026ProcureprimeB2bEnterprisePortalDevelopedBy")}{" "}<strong>{tx("navigation:agentxPrime")}</strong>.</p>
          <ul aria-label={tx("navigation:platformInformation")}>
            <li>{tx("navigation:aiForBusinessInnovation2026")}</li>
            <li>{tx("navigation:deterministicGovernanceEngine")}</li>
            <li>{tx("navigation:webmcpIntegration")}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
