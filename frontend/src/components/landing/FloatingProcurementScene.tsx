import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, FileText, Layers3, MessageSquareText, Pause, Play } from "lucide-react";
import { tx } from "../../i18n";
import { landingScene } from "./landingScene";
import "./floatingProcurementScene.css";
const ProcurementSatellites = lazy(() => import("./ProcurementSatellites").catch(() => ({ default: () => null })));

/** An illustrative object assembly. It never reads a request or represents live AI activity. */
export default function FloatingProcurementScene() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    // Read the observer's completed layout, rather than forcing layout during React's commit.
    const observer = new ResizeObserver(([entry]) => {
      element.style.setProperty("--scene-scale", String(entry.contentRect.width / 700));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Content and artwork render immediately; the optional motion engine is a separate small chunk.
    import("./procurementSceneMotion").then(({ mountProcurementScene }) => {
      if (!disposed && root.current && stage.current) cleanup = mountProcurementScene(root.current, stage.current);
    }).catch(() => { if (!disposed) setPaused(true); });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <figure ref={root} className="pl-device-scene fp-figure" data-motion={paused ? "paused" : "on"}>
    <div ref={stage} className="fp-scene" role="img" aria-label={tx("marketing:sceneDescription")}>
      <div className="fp-world" aria-hidden="true">
        <div className="fp-ambient" />
        <div className="fp-ground" />
        <div className="fp-ground-shadow"><span /></div>
        <svg className="fp-connections" viewBox="0 0 700 540" fill="none">
          <path d="M134 122 C152 246 238 336 350 354 S528 318 584 224" />
          <circle cx="140" cy="429" r="4" /><circle cx="350" cy="429" r="4" /><circle cx="566" cy="429" r="4" />
        </svg>
        <div className="fp-pointer-space">


          <div className="fp-core-position fp-placement"><div className="fp-enter fp-enter-core"><div className="fp-float fp-float-core">
            <div className="fp-core-depth" />
            <div className="fp-core-side" />
            <div className="fp-core-face">
              <div className="fp-core-top"><span>Procure<strong>Prime</strong></span><Layers3 size={19} /></div>
              <div className="fp-core-title">{tx("marketing:sceneCoreTitle")}</div>
              <div className="fp-device-window">
                <picture><source type="image/webp" srcSet={landingScene.srcSet} sizes={landingScene.sizes} /><img src={landingScene.src} width={1600} height={900} alt="" fetchPriority="high" decoding="async" /></picture>
                <span className="fp-window-index">02</span>
              </div>
              <div className="fp-core-workflow"><MessageSquareText size={15} /><span>{tx("marketing:requirements")}</span><ArrowRight size={14} /><Layers3 size={15} /><span>{tx("marketing:options")}</span><ArrowRight size={14} /><FileText size={15} /></div>
            </div>
          </div></div></div>

          <Suspense fallback={null}><ProcurementSatellites /></Suspense>
        </div>
        <div className="fp-dock-labels"><span>01 <strong>{tx("marketing:requirements")}</strong></span><span>02 <strong>{tx("marketing:options")}</strong></span><span>03 <strong>{tx("marketing:quotation")}</strong></span></div>
      </div>
    </div>
    <figcaption className="fp-caption"><p>{tx("marketing:sceneIllustration")}</p><button type="button" className="fp-motion-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}<span>{tx(paused ? "marketing:sceneResume" : "marketing:scenePause")}</span></button></figcaption>
    <div className="fp-scene-footer"><p>{tx("marketing:aiGeneratedConceptImageDoesNotRepresent")}</p><span className="fp-scroll-hint">{tx("marketing:sceneSpatialHint")}<ArrowRight size={14} aria-hidden="true" /></span></div>
  </figure>;
}
