/** Optional DOM-only motion. No React renders, business state, API or AI events. */
export function mountProcurementScene(root: HTMLElement, stage: HTMLDivElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const desktop = window.matchMedia("(min-width: 1024px)");
  const hero = root.closest<HTMLElement>(".pl-hero");
  const connection = stage.querySelector<SVGPathElement>(".fp-connections path");
  let visible = true;
  let enabled = true;
  let frame = 0;
  let scrollFrame = 0;
  let previous = 0;
  let lastProgress = -1;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let pointerBounds: DOMRect | undefined;

  const updateScroll = () => {
    scrollFrame = 0;
    if (!hero || reduced.matches || !desktop.matches) { lastProgress = -1; root.dataset.story = "ecosystem"; stage.style.setProperty("--story", "0"); connection?.setAttribute("d", "M134 122 C152 246 238 336 350 354 S528 318 584 224"); return; }
    if (!enabled) return;
    const top = hero.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, (20 - top) / 240));
    if (progress === lastProgress) return;
    lastProgress = progress;
    stage.style.setProperty("--story", progress.toFixed(4));
    const mix = (from: number, to: number) => (from + (to - from) * progress).toFixed(1);
    connection?.setAttribute("d", `M${mix(134,140)} ${mix(122,429)} C${mix(152,215)} ${mix(246,429)} ${mix(238,275)} ${mix(336,429)} 350 ${mix(354,429)} S${mix(528,495)} ${mix(318,429)} ${mix(584,566)} ${mix(224,429)}`);
    root.dataset.story = progress < .05 ? "ecosystem" : progress > .95 ? "workflow" : "transition";
  };
  const scheduleScroll = () => { if (!scrollFrame && visible && !document.hidden) scrollFrame = requestAnimationFrame(updateScroll); };
  const draw = (now: number) => {
    frame = 0;
    if (!enabled || !visible || document.hidden || !fine.matches) return;
    // A high-refresh pointer does not need more than 60 style updates per second.
    if (previous && now - previous < 1000 / 60) { frame = requestAnimationFrame(draw); return; }
    const alpha = 1 - Math.exp(-Math.min(40, previous ? now - previous : 16) / 95);
    previous = now;
    x += (targetX - x) * alpha; y += (targetY - y) * alpha;
    stage.style.setProperty("--tilt-x", `${(-y * 3).toFixed(3)}deg`);
    stage.style.setProperty("--tilt-y", `${(x * 3).toFixed(3)}deg`);
    stage.style.setProperty("--pointer-x", `${(x * 8).toFixed(3)}px`);
    stage.style.setProperty("--pointer-y", `${(y * 6).toFixed(3)}px`);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .001) frame = requestAnimationFrame(draw);
    else previous = 0;
  };
  const schedulePointer = () => { if (!frame && enabled && fine.matches && visible && !document.hidden) frame = requestAnimationFrame(draw); };
  const enter = () => { pointerBounds = stage.getBoundingClientRect(); };
  const move = (event: PointerEvent) => {
    if (!enabled || !fine.matches || event.pointerType === "touch") return;
    const bounds = pointerBounds || stage.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    schedulePointer();
  };
  const leave = () => { targetX = 0; targetY = 0; pointerBounds = undefined; schedulePointer(); };
  const resetPointer = () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0; x = y = targetX = targetY = 0;
    for (const property of ["--tilt-x", "--tilt-y", "--pointer-x", "--pointer-y"]) stage.style.removeProperty(property);
  };
  const configure = () => {
    enabled = !reduced.matches && root.dataset.motion !== "paused";
    root.dataset.reduced = reduced.matches ? "true" : "false";
    root.dataset.visible = visible && !document.hidden ? "true" : "false";
    if (!enabled || !fine.matches || !visible || document.hidden) resetPointer();
    updateScroll();
  };
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; configure(); }, { rootMargin: "40px" });
  observer.observe(stage);
  const mutation = new MutationObserver(configure);
  mutation.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  stage.addEventListener("pointerenter", enter);
  stage.addEventListener("pointermove", move, { passive: true });
  stage.addEventListener("pointerleave", leave);
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", leave, { passive: true });
  window.addEventListener("resize", scheduleScroll, { passive: true });
  document.addEventListener("visibilitychange", configure);
  for (const query of [reduced, fine, desktop]) query.addEventListener("change", configure);
  configure();
  return () => {
    cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame);
    observer.disconnect(); mutation.disconnect();
    stage.removeEventListener("pointerenter", enter); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave);
    window.removeEventListener("scroll", scheduleScroll); window.removeEventListener("resize", leave); window.removeEventListener("resize", scheduleScroll);
    document.removeEventListener("visibilitychange", configure);
    for (const query of [reduced, fine, desktop]) query.removeEventListener("change", configure);
    resetPointer(); stage.style.setProperty("--story", "0");
  };
}
