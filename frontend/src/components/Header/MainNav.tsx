import { tx, useLocale } from "../../i18n";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, SlidersHorizontal } from "lucide-react";

interface MainNavProps {
  onViewProducts: () => void;
  isAdmin?: boolean;
}

const MainNav: React.FC<MainNavProps> = ({ onViewProducts, isAdmin = false }) => {
  useLocale();
  const { pathname } = useLocation();

  return (
    <nav className="pp-main-nav" aria-label={tx("navigation:mainNavigation")}>
      <Link to="/" className="pp-main-nav__item" aria-current={pathname === "/" ? "page" : undefined} title={tx("navigation:businessPortalHome")}>{tx("navigation:home")}</Link>
      <button type="button" onClick={onViewProducts} className="pp-main-nav__item" aria-current={pathname.startsWith("/products") ? "page" : undefined}>{tx("navigation:b2bDeviceCatalog")}</button>
      <Link to="/cart" className="pp-main-nav__item" aria-current={pathname === "/cart" ? "page" : undefined} title={tx("navigation:viewEquipmentForYourQuotationRequest")}>{tx("navigation:cart")}</Link>
      {isAdmin ? (
        <div className="pp-main-nav__admin">
          <Link to="/admin/workspace" className="pp-main-nav__item pp-main-nav__item--copilot" aria-current={pathname === "/admin/workspace" ? "page" : undefined} title={tx("navigation:openAiProcurementCopilotForSalesProcurement")}>
            <Bot size={18} aria-hidden="true" />
            <span>{tx("navigation:aiCopilot")}</span>
          </Link>
          <Link to="/admin/policies" className="pp-main-nav__item" aria-current={pathname === "/admin/policies" ? "page" : undefined} title={tx("navigation:procurementPoliciesBudgetManagement")}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>{tx("navigation:policies")}</span>
          </Link>
        </div>
      ) : null}
    </nav>
  );
};

export default MainNav;
