import React from "react";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(90deg, #0757C9 0%, #F4510B 100%)",
    color: "#FFFFFF",
    boxShadow: "0 12px 30px rgba(5,45,114,0.18)",
    border: "none",
  },
  secondary: {
    background: "linear-gradient(90deg, #7726D5 0%, #E22987 100%)",
    color: "#FFFFFF",
    boxShadow: "0 12px 30px rgba(119,38,213,0.18)",
    border: "none",
  },
  outline: {
    background: "transparent",
    color: "#0757C9",
    border: "2px solid #0757C9",
    boxShadow: "none",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "14px" },
  md: { padding: "12px 20px", fontSize: "16px" },
  lg: { padding: "16px 32px", fontSize: "18px" },
};

const baseStyle: React.CSSProperties = {
  borderRadius: "9999px",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontWeight: 600,
  letterSpacing: "0.02em",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  textDecoration: "none",
  lineHeight: 1,
};

export function GlowButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ariaLabel,
  ...rest
}: Props) {
  const style = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transform: disabled ? "none" : "translateY(0)",
  } as React.CSSProperties;

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && variant !== "outline") {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = variant === "primary"
        ? "0 16px 40px rgba(5,45,114,0.25)"
        : "0 16px 40px rgba(119,38,213,0.25)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = variant === "primary"
        ? "0 12px 30px rgba(5,45,114,0.18)"
        : "0 12px 30px rgba(119,38,213,0.18)";
    }
  };

  return (
    <button
      type={type}
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export default GlowButton;