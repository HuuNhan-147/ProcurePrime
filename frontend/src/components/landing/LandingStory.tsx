import { tx, useLocale } from "../../i18n";
import React, { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const LandingStory = () => {
  useLocale();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-pl-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    element.querySelectorAll("[data-pl-reveal]").forEach((item) => observer.observe(item));
    element.setAttribute("data-pl-motion", "ready");
    return () => { observer.disconnect(); element.removeAttribute("data-pl-motion"); };
  }, []);

  return (
    <section ref={root} className="pl-story" aria-labelledby="pl-story-title">
      <div className="pl-wrap pl-story-grid">
        <div className="pl-story-copy" data-pl-reveal>
          <p className="pl-eyebrow">{tx("marketing:aiAssistsYouDecide")}</p>
          <h2 id="pl-story-title">{tx("marketing:lessContextSwitching")}<br />{tx("marketing:clarityAtEveryStep")}</h2>
          <p>{tx("marketing:fromTheFirstDescriptionToEquipmentDetails")}</p>
          <Link to="/workspace" className="pl-story-link">{tx("marketing:exploreAiWorkspace")}{" "}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="pl-story-sequence" data-pl-reveal>
          <div><span>01</span><h3>{tx("marketing:clarifyWhatYouNeed")}</h3><p>{tx("marketing:enterRequirementsDirectlyOrPrepareARequest")}</p></div>
          <ArrowDown size={20} strokeWidth={1.5} aria-hidden="true" />
          <div><span>02</span><h3>{tx("marketing:reviewTheEquipmentDetails")}</h3><p>{tx("marketing:checkSpecificationsPricesAndCatalogInformationBefore")}</p></div>
          <ArrowDown size={20} strokeWidth={1.5} aria-hidden="true" />
          <div><span>03</span><h3>{tx("marketing:reviewBeforeYouDecide")}</h3><p>{tx("marketing:seeDetailsInWorkspaceYouControlWhen")}</p></div>
        </div>
      </div>
    </section>
  );
};

export default LandingStory;
