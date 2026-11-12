import React from "react";

interface PrimeSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "paper" | "subtle" | "contrast";
  elevation?: "flat" | "raised";
}

const PrimeSurface = ({ variant = "default", elevation = "flat", className = "", ...props }: PrimeSurfaceProps) => (
  <div className={`pp-surface pp-surface--${variant} pp-surface--${elevation} ${className}`.trim()} {...props} />
);

export default PrimeSurface;
