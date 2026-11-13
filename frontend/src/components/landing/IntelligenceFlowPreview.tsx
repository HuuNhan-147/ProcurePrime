import { tx, uiMessage, uiText, useLocale } from "../../i18n";
import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, FileText, ListFilter, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import PrimeStatus from "../ui/PrimeStatus";

const checkpoints = [
  { label: uiMessage("marketing:requirements"), title: uiMessage("marketing:startWithTheWorkYouDo"), description: uiMessage("marketing:describeDevicesQuantitiesSpecificationsAndBudgetYou"), icon: MessageSquareText },
  { label: uiMessage("marketing:options"), title: uiMessage("marketing:reviewTheDetailsConsiderYourOptions"), description: uiMessage("marketing:reviewDevicesSpecificationsAndCatalogPricesBefore"), icon: ListFilter },
  { label: uiMessage("marketing:quotation"), title: uiMessage("marketing:theDetailYouNeedForTheNext"), description: uiMessage("marketing:continueInWorkspaceToReviewTheEquipment"), icon: FileText },
];

const IntelligenceFlowPreview = () => {
  useLocale();
  const [active, setActive] = useState(0);
  const last = useRef(active);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();
  const checkpoint = checkpoints[active];
  const Icon = checkpoint.icon;

  useEffect(() => {
    if (last.current === active) return;
    last.current = active;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = content.current?.querySelector<HTMLElement>(".pl-flow-art")?.animate?.(
      [{ transform: "translate3d(0,0,-24px) rotateY(7deg)" }, { transform: "translate3d(0,0,0) rotateY(0deg)" }],
      { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    return () => animation?.cancel();
  }, [active]);

  return (
    <section id="intelligence-flow" className="pl-flow pl-wrap" aria-labelledby={`${id}-title`}>
      <div className="pl-section-heading">
        <div><p className="pl-eyebrow">{tx("marketing:oneConnectedWorkflow")}</p><h2 id={`${id}-title`}>{tx("marketing:fromRequirementsToQuotation")}</h2></div>
        <PrimeStatus tone="neutral">{tx("marketing:workflowIllustration")}</PrimeStatus>
      </div>
      <div className="pl-flow-stations" role="group" aria-label={tx("marketing:exploreTheThreeWorkflowSteps")}>
        {checkpoints.map((step, index) => (
          <button key={step.label} type="button" aria-pressed={active === index} aria-controls={`${id}-content`} onClick={() => setActive(index)}>
            <span className="pl-step-number" aria-hidden="true">0{uiText(index + 1)}</span>
            <span>{uiText(step.label)}</span><ArrowRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div ref={content} id={`${id}-content`} className="pl-flow-content" aria-live="polite" aria-atomic="true">
        <div className="pl-flow-copy"><Icon size={26} strokeWidth={1.5} aria-hidden="true" /><p className="pl-flow-position">{tx("marketing:workflowStep", { step: active + 1, total: checkpoints.length })}</p><h3>{uiText(checkpoint.title)}</h3><p>{uiText(checkpoint.description)}</p></div>
        <div className="pl-flow-art" aria-label={tx("marketing:illustrativeStructureNotAnAiResult")}>
          <div className="pl-flow-context"><MessageSquareText size={18} aria-hidden="true" /><span>{tx("marketing:workflowContext")}</span></div>
          {active === 0 && <><p className="pl-art-caption">{tx("marketing:contextYouProvide")}</p><div className="pl-request-example">{tx("marketing:weNeedEquipmentForOurOfficeTeam")}</div><div className="pl-context-keys"><span>{tx("marketing:devices")}</span><span>{tx("marketing:quantity")}</span><span>{tx("marketing:specifications")}</span><span>{tx("marketing:budget")}</span></div></>}
          {active === 1 && <><p className="pl-art-caption">{tx("marketing:detailsToConsider")}</p><dl className="pl-option-lines"><div><dt>{tx("marketing:devices")}</dt><dd>{tx("marketing:nameSpecifications")}</dd></div><div><dt>{tx("marketing:cost")}</dt><dd>{tx("marketing:catalogPrice")}</dd></div><div><dt>{tx("marketing:availability")}</dt><dd>{tx("marketing:stockInformation")}</dd></div></dl><Link to="/products" className="pl-text-link">{tx("marketing:viewTheActualCatalog")}{" "}<ArrowRight size={16} aria-hidden="true" /></Link></>}
          {active === 2 && <><div className="pl-document-heading"><strong>{tx("marketing:procureprime")}</strong><span>{tx("marketing:illustrativeStructure")}</span></div><div className="pl-document-line"><span>{tx("marketing:deviceQuantityUnitPrice")}</span><span>—</span></div><div className="pl-document-line"><span>{tx("marketing:discountTax")}</span><span>—</span></div><div className="pl-document-total"><strong>{tx("marketing:total")}</strong><span>—</span></div><p className="pl-art-caption">{tx("marketing:thisPreviewDoesNotCreateAQuotation")}</p></>}
        </div>
      </div>
      <p className="pl-flow-note">{tx("marketing:thisIllustrationExplainsTheWorkflowItDoes")}</p>
    </section>
  );
};

export default IntelligenceFlowPreview;
