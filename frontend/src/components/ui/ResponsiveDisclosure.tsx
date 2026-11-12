import React, { useEffect, useState } from "react";

/** Keeps form controls mounted while compact layouts can fold secondary tools. */
export default function ResponsiveDisclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setOpen(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <details className="pp-responsive-disclosure" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}><summary>{label}</summary>{children}</details>;
}
