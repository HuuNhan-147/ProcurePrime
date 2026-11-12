import React, { Suspense, useEffect, useState } from "react";
import { tx, useLocale } from "../../i18n";
import { AccessibleDialog } from "./PresentationAccess";

/** Load a dialog's UI on first opening, then keep it mounted to preserve its draft. */
export default function DeferredDialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useLocale();
  const [visited, setVisited] = useState(open);
  useEffect(() => { if (open) setVisited(true); }, [open]);
  if (!open && !visited) return null;
  return <Suspense fallback={open ? <AccessibleDialog onClose={onClose} aria-label={tx("common:screen.loading")} className="pp-dialog"><div className="bg-white p-6 rounded-lg"><p role="status">{tx("common:screen.loading")}</p><button type="button" onClick={onClose}>{tx("quotation:close")}</button></div></AccessibleDialog> : null}>{children}</Suspense>;
}
