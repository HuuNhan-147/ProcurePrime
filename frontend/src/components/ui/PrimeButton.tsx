import React, { forwardRef } from "react";

interface PrimeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet";
  size?: "default" | "compact";
  isLoading?: boolean;
}

const PrimeButton = forwardRef<HTMLButtonElement, PrimeButtonProps>(
  ({ variant = "primary", size = "default", isLoading = false, type = "button", disabled, className = "", children, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      type={type}
      className={`pp-button pp-button--${variant} pp-button--${size} ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <span className="pp-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
);

PrimeButton.displayName = "PrimeButton";

export default PrimeButton;
