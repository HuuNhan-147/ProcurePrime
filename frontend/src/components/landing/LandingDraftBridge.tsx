import { tx, uiText, useLocale } from "../../i18n";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./landing.css";

interface LandingDraft {
  version: 1;
  id: string;
  text: string;
  origin: "landing";
}

interface LandingDraftBridgeProps {
  currentDraft: string;
  busy: boolean;
  onApplyDraft: (text: string) => void;
}

const isDraft = (value: unknown): value is LandingDraft => {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<LandingDraft>;
  return draft.version === 1 && draft.origin === "landing" && typeof draft.id === "string" && draft.id.length > 0 && draft.id.length <= 100 &&
    typeof draft.text === "string" && draft.text.trim().length > 0 && draft.text.length <= 1800;
};

const LandingDraftBridge = ({ currentDraft, busy, onApplyDraft }: LandingDraftBridgeProps) => {
  useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const seen = useRef(new Set<string>());
  const consumedEntries = useRef(new Set<string>());
  const root = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState<{ draft: LandingDraft | null; applied: boolean } | null>(null);

  useEffect(() => {
    const state = location.state;
    if (!state || typeof state !== "object" || !Object.prototype.hasOwnProperty.call(state, "procurePrimeDraft")) return;
    if (consumedEntries.current.has(location.key)) return;
    consumedEntries.current.add(location.key);
    const { procurePrimeDraft: candidate, ...rest } = state;
    const valid = isDraft(candidate);
    const key = valid ? candidate.id : `invalid:${location.key}`;
    if (!seen.current.has(key)) {
      seen.current.add(key); // Mark before any state update: StrictMode must not apply the same draft twice.
      const applied = valid && !currentDraft.trim() && !busy;
      setNotice({ draft: valid ? candidate : null, applied });
      if (applied) onApplyDraft(candidate.text);
    }
    navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, {
      replace: true,
      state: Object.keys(rest).length ? rest : null,
    });
  }, [location, navigate, currentDraft, busy, onApplyDraft]);

  useEffect(() => {
    if (!notice?.applied) return;
    const frame = requestAnimationFrame(() => {
      root.current?.parentElement?.querySelector<HTMLInputElement>("[data-landing-draft-input]")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [notice]);

  if (!notice) return null;

  const appendDraft = () => {
    if (!notice.draft || busy) return;
    onApplyDraft(notice.draft.text);
    setNotice({ ...notice, applied: true });
  };

  const dismissNotice = () => {
    const scope = root.current?.parentElement;
    const field = scope?.querySelector<HTMLInputElement>("[data-landing-draft-input]");
    const fallback = root.current?.nextElementSibling?.querySelector<HTMLButtonElement>("button:last-child");
    setNotice(null);
    if (field && !field.disabled) field.focus({ preventScroll: true });
    else fallback?.focus({ preventScroll: true });
  };

  return (
    <div ref={root} className="pp-landing-draft-bridge">
      <p role="status">{uiText(!notice.draft ? tx("marketing:unableToReceiveThisDraftYouCan") : notice.applied ? tx("marketing:draftReceivedFromHomeReviewItBefore") : busy ? tx("marketing:yourRequestFromHomeIsRetainedYou") : tx("marketing:workspaceAlreadyHasADraftYourCurrent"))}</p>
      {notice.draft && !notice.applied && <details><summary>{tx("marketing:viewTheRequestFromHome")}</summary><p>{uiText(notice.draft.text)}</p></details>}
      <div className="pp-landing-draft-actions">
        {notice.draft && !notice.applied && <button type="button" onClick={appendDraft} disabled={busy}>{uiText(currentDraft.trim() ? tx("marketing:appendToTheCurrentDraft") : tx("marketing:addToComposer"))}</button>}
        <button type="button" onClick={dismissNotice}>{uiText(notice.applied ? tx("marketing:closeNotification") : tx("marketing:dismissIncomingRequest"))}</button>
      </div>
    </div>
  );
};

export default LandingDraftBridge;
