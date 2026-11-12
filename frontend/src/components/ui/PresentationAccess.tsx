import React, { useEffect, useRef } from "react";

export function usePresentationFocus<T extends HTMLElement = HTMLElement>(open: boolean, onClose: () => void, trap = true) {
  const root = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = root.current;
    const available = () => [...(element?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex='0']") || [])].filter((node) => node.getClientRects().length && !node.closest("[hidden],[inert]") && getComputedStyle(node).visibility !== "hidden");
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => available()[0]?.focus({ preventScroll:true }));
    });
    const keyboard = (event: KeyboardEvent) => {
      const dialog = (event.target as HTMLElement)?.closest?.('[role="dialog"][aria-modal="true"]');
      if (trap && dialog && dialog !== element) return;
      if (event.key === "Escape" && !event.isComposing) { event.stopPropagation(); close.current(); }
      if (!trap || event.key !== "Tab") return;
      const nodes = available(), first = nodes[0], last = nodes[nodes.length - 1];
      if (!element?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const events = trap ? document : element;
    events?.addEventListener("keydown", keyboard);
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); events?.removeEventListener("keydown", keyboard); if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, [open, trap]);
  return root;
}

/** UI-only dialog boundary. Restores focus; never calls form or API handlers. */
export function AccessibleDialog({ children, onClose, ...props }: React.HTMLAttributes<HTMLDivElement> & { onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => [...(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex='0']") || [])].find(node => node.getClientRects().length && !node.closest("[hidden],[inert]") && getComputedStyle(node).visibility !== "hidden")?.focus());
    return () => { cancelAnimationFrame(frame); if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, []);
  return <div {...props} ref={root} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={(event) => {
    if (event.key === "Escape" && !event.nativeEvent.isComposing) { event.stopPropagation(); close.current(); }
    if (event.key !== "Tab") return;
    const nodes = [...(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex='0']") || [])].filter((node) => node.getClientRects().length && !node.closest("[hidden],[inert]") && getComputedStyle(node).visibility !== "hidden");
    if (!nodes.length) { event.preventDefault(); root.current?.focus(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>{children}</div>;
}
