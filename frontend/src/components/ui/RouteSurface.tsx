import React, { Component, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { tx, useLocale } from "../../i18n";
import { loadScreenNamespaces, type ScreenNamespace } from "../../i18n/namespaces";
import { preloadLandingScene } from "../landing/landingScene";

export function lazyPage<T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>, namespaces: readonly ScreenNamespace[] = []) {
  return lazy(() => Promise.all([loader(), loadScreenNamespaces(namespaces)]).then(([module]) => module));
}
function LoadingSurface() {
  useLocale();
  return <div className="pp-route-state" role="status"><span className="pp-route-progress" aria-hidden="true" /><p>{tx("common:screen.loading")}</p></div>;
}
function ErrorSurface() {
  useLocale();
  return <section className="pp-route-state" role="alert"><h1>{tx("common:screen.unavailable")}</h1><p>{tx("common:screen.explanation")}</p><Link to="/">{tx("common:screen.home")}</Link><button type="button" onClick={() => window.location.reload()}>{tx("common:screen.reload")}</button></section>;
}
class ScreenBoundary extends Component<{ children: React.ReactNode; screen: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous: Readonly<{ children: React.ReactNode; screen: string }>) {
    if (this.state.failed && previous.screen !== this.props.screen) this.setState({ failed: false });
  }
  render() { return this.state.failed ? <ErrorSurface /> : this.props.children; }
}

/** A loading/error boundary owns presentation only. Providers and shared sockets stay outside. */
export default function RouteSurface({ children }: { children: React.ReactNode }) {
  const { pathname, search } = useLocation();
  if (pathname === "/") preloadLandingScene();
  return <ScreenBoundary screen={pathname + search}><Suspense fallback={<LoadingSurface />}>{children}</Suspense></ScreenBoundary>;
}
