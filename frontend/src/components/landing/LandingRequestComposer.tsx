import { tx, uiMessage, uiText, useLocale, locale } from "../../i18n";
import React, { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PrimeButton from "../ui/PrimeButton";

interface LandingRequestComposerProps {
  workspacePath?: "/workspace" | "/admin/workspace";
}

const LandingRequestComposer = ({ workspacePath = "/workspace" }: LandingRequestComposerProps) => {
  useLocale();
  const navigate = useNavigate();
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const submitted = useRef(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const openWorkspace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || text.length > 1800) {
      setError(!text ? uiMessage("marketing:describeYourRequirementsBeforeOpeningWorkspace") : uiMessage("marketing:keepYourRequestWithin1800Characters"));
      field.current?.focus();
      return;
    }
    if (submitted.current) return;
    submitted.current = true;
    const draftId = globalThis.crypto?.randomUUID?.() ?? `landing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    navigate(workspacePath, {
      state: { procurePrimeDraft: { version: 1, id: draftId, text, origin: "landing" } },
    });
  };

  return (
    <form className="pl-request" onSubmit={openWorkspace} aria-label={tx("marketing:startAPurchaseRequest")}>
      <label htmlFor={`${id}-request`}>{tx("marketing:whatDoYouNeedToProcure")}</label>
      <textarea
        ref={field}
        id={`${id}-request`}
        rows={2}
        maxLength={1800}
        value={value}
        placeholder={tx("marketing:devicesQuantitiesSpecificationsBudget")}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={!!error}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
          submitted.current = false;
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="pl-request-footer">
        <p id={`${id}-hint`}>{tx("marketing:youCanEditInWorkspaceBeforeSending")}</p>
        <PrimeButton type="submit" className="pl-request-submit">{tx("marketing:openInAiWorkspace")}{" "}<ArrowUpRight size={18} aria-hidden="true" />
        </PrimeButton>
      </div>
      {error && <p id={`${id}-error`} className="pl-form-error" role="alert">{uiText(error)}</p>}
      <div className="pl-request-meta">
        <span className="pl-keyboard-hint">{tx("marketing:ctrlEnterToOpen")}</span>
        <span>{uiText(value.length.toLocaleString(locale()))}{" "}{tx("marketing:1800Characters")}</span>
      </div>
    </form>
  );
};

export default LandingRequestComposer;
