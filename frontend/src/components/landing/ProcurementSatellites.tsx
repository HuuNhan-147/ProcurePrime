import { FileText, MessageSquareText, SlidersHorizontal } from "lucide-react";
import { tx } from "../../i18n";

/** Non-critical illustration layers, independent of application data. */
export default function ProcurementSatellites() {
  return <>
          <div className="fp-request-position fp-placement"><div className="fp-enter fp-enter-request"><div className="fp-float fp-float-request fp-paper">
            <div className="fp-paper-title"><MessageSquareText size={18} /><strong>{tx("marketing:requirements")}</strong></div>
            <div className="fp-request-lines"><i /><i /><i /></div>
            <div className="fp-paper-foot">{tx("marketing:devices")} · {tx("marketing:budget")}</div>
          </div></div></div>
          <div className="fp-spec-position fp-placement"><div className="fp-enter fp-enter-spec"><div className="fp-float fp-float-spec fp-paper">
            <div className="fp-paper-title"><SlidersHorizontal size={17} /><strong>{tx("marketing:specifications")}</strong><span className="fp-paper-corner">02</span></div>
            <div className="fp-spec-table"><span>RAM</span><i /><i /><span>SSD</span><i /><i /></div>
            <div className="fp-paper-foot">{tx("marketing:detailsToConsider")}</div>
          </div></div></div>

          <div className="fp-quote-position fp-placement"><div className="fp-enter fp-enter-quote"><div className="fp-float fp-float-quote fp-paper">
            <div className="fp-quote-fold" />
            <div className="fp-paper-title"><FileText size={20} strokeWidth={1.4} /><strong className="fp-quote-title">{tx("marketing:quotation")}</strong></div>
            <div className="fp-quote-rule" />
            <div className="fp-quote-lines"><i /><i /><i /></div>
            <div className="fp-quote-total"><span>{tx("marketing:total")}</span><span>—</span></div>
          </div></div></div>

          <div className="fp-principle-position fp-placement"><div className="fp-enter fp-enter-principle"><div className="fp-float fp-float-principle">
            <span className="fp-principle-mark"><MessageSquareText size={25} strokeWidth={1.5} /></span>
            <strong>{tx("marketing:aiAssistsYouDecide").split(/(?<=\.)\s+/u).map(sentence => <span key={sentence}>{sentence}</span>)}</strong>
          </div></div></div>
  </>;
}
