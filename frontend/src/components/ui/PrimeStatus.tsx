import React from "react";

interface PrimeStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "info" | "positive" | "warning" | "danger";
}

// Callers supply the actual label and opt into live-region semantics when appropriate.
const PrimeStatus = ({ tone = "neutral", className = "", children, ...props }: PrimeStatusProps) => (
  <span className={`pp-status pp-status--${tone} ${className}`.trim()} {...props}>
    {children}
  </span>
);

export default PrimeStatus;
