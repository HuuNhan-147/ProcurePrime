import { useEffect, useState } from "react";
import { i18n } from "../../i18n";
import { loadScreenNamespaces, type ScreenNamespace } from "../../i18n/namespaces";

/** UI asset readiness only. Never owns or resets conversation/session/socket state. */
export function useNamespaceReady(active: boolean, names: readonly ScreenNamespace[]) {
  const loaded = () => names.every(name => i18n.hasResourceBundle("vi", name) && i18n.hasResourceBundle("en", name));
  const [ready, setReady] = useState(loaded);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!active || ready) return;
    let mounted = true;
    setFailed(false);
    loadScreenNamespaces(names).then(() => { if (mounted) setReady(true); }).catch(() => { if (mounted) setFailed(true); });
    return () => { mounted = false; };
  }, [active, ready, attempt, names]);
  return { ready, failed, retry: () => setAttempt(current => current + 1) };
}
