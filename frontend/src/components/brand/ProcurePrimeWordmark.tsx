import React from "react";

type ProcurePrimeWordmarkProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

const ProcurePrimeWordmark = ({ className = "", ...props }: ProcurePrimeWordmarkProps) => (
  <span className={`pp-wordmark ${className}`.trim()} {...props}>
    Procure<span className="pp-wordmark__prime">Prime</span>
  </span>
);

export default ProcurePrimeWordmark;
